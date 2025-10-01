import { GoogleGenAI, Type } from "@google/genai";
import type { Food, Recipe, Source, Question, PersonalizedPlan, Disease } from '../types';
import { INFLAMMATION_RECIPES } from '../data/inflammationRecipes';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. App functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const foodListSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Le nom de l\'aliment en français.' },
        summary: { type: Type.STRING, description: 'Un résumé d\'une phrase sur ses bienfaits pour la maladie.' },
      },
      required: ['name', 'summary'],
    },
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Le nom de la recette.' },
      ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'La liste des ingrédients.' },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Les instructions étape par étape.' },
      benefits: { type: Type.STRING, description: 'Une courte explication des bienfaits thérapeutiques de la recette.' },
    },
    required: ['title', 'ingredients', 'instructions', 'benefits'],
};

const symptomListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
    description: 'Un symptôme courant et concis associé à la maladie.'
  },
};

const questionListSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: 'Un identifiant unique pour la question (ex: "q1").' },
            text: { type: Type.STRING, description: 'Le texte de la question fermée (Oui/Non).' },
        },
        required: ['id', 'text'],
    },
};

const personalizedPlanSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING, description: "Une brève analyse basée sur les réponses, commençant par 'Basé sur vos réponses...' et restant générale. Inclure un avertissement de consulter un médecin." },
        prescription: { type: Type.STRING, description: "Une liste à puces d'aliments spécifiques à consommer, présentée comme une 'ordonnance alimentaire'." },
        explanation: { type: Type.STRING, description: "Une explication de pourquoi ces aliments sont recommandés pour guérir plus vite." },
    },
    required: ['analysis', 'prescription', 'explanation'],
};


export const generateInitialContent = async (disease: Pick<Disease, 'id' | 'name'>): Promise<{ foods: Food[], recipes: Recipe[] }> => {
  try {
    const foodPrompt = `Liste 5 aliments biologiques clés bénéfiques pour une personne atteinte de "${disease.name}". Pour chaque aliment, fournis son nom et un résumé d'une phrase de son principal bienfait.`;
    
    const foodResponsePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: foodPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: foodListSchema,
        }
    });

    let recipesPromise: Promise<Recipe[]>;

    if (disease.id === 'arthritis') {
      // Use the curated list of recipes for inflammation
      recipesPromise = Promise.resolve(INFLAMMATION_RECIPES);
    } else {
      // Generate a single recipe for other conditions
      const recipePrompt = `Génère une recette simple et thérapeutique pour une personne atteinte de "${disease.name}".`;
      recipesPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: recipePrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: recipeSchema,
        }
      }).then(response => {
        const recipe: Recipe = JSON.parse(response.text);
        recipe.diseaseId = disease.id; // Tag the recipe
        return [recipe];
      });
    }

    const [foodResponse, recipes] = await Promise.all([
      foodResponsePromise,
      recipesPromise
    ]);

    const foods: Food[] = JSON.parse(foodResponse.text);
    
    return { foods, recipes };

  } catch (error) {
    console.error("Error generating initial content:", error);
    throw new Error("Failed to generate content from AI.");
  }
};


export const generateFoodDetails = async (foodName: string, diseaseName: string): Promise<{ details: string; sources: Source[] }> => {
    try {
        const prompt = `Explique en détail les bienfaits thérapeutiques de "${foodName}" pour une personne atteinte de "${diseaseName}". Reste concis, clair et base-toi sur des principes nutritionnels reconnus et des informations vérifiables. Structure la réponse en paragraphes.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        const details = response.text;
        // FIX: The type of `groundingChunks` from the Gemini API is not directly compatible with `Source[]`.
        // The API may return `web.uri` as optional, but our `Source` type requires it.
        // This filters out chunks without a URI and maps the valid ones to the `Source` type, ensuring type safety.
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: Source[] = groundingChunks
            .filter(chunk => chunk.web && chunk.web.uri)
            .map(chunk => ({
                web: {
                    uri: chunk.web!.uri!,
                    title: chunk.web!.title || chunk.web!.uri!,
                }
            }));

        return { details, sources };

    } catch (error) {
        console.error(`Error generating details for ${foodName}:`, error);
        throw new Error("Failed to generate food details.");
    }
};

export const generatePremiumRecipe = async (disease: Pick<Disease, 'id' | 'name'>, existingFoods: string[]): Promise<Recipe> => {
    try {
        const prompt = `Génère une nouvelle recette créative et thérapeutique pour une personne atteinte de "${disease.name}", en utilisant si possible certains de ces aliments : ${existingFoods.join(', ')}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: recipeSchema,
            }
        });
        const recipe: Recipe = JSON.parse(response.text);
        recipe.diseaseId = disease.id; // Tag the recipe
        return recipe;
    } catch (error) {
        console.error("Error generating premium recipe:", error);
        throw new Error("Failed to generate premium recipe.");
    }
};


export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Photographie culinaire professionnelle de qualité supérieure : ${prompt}. Gros plan (macro shot), éclairage naturel et lumineux, sur un fond propre et minimaliste. L'aliment doit paraître frais, vibrant et appétissant.`,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("No image generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        // Fallback to a placeholder service if image generation fails
        return `https://picsum.photos/512?random=${Math.random()}`;
    }
};

export const generateCommonSymptoms = async (diseaseName: string): Promise<string[]> => {
    try {
        const prompt = `Liste 5 symptômes courants et concis pour une personne atteinte de "${diseaseName}".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: symptomListSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating common symptoms:", error);
        throw new Error("Failed to generate common symptoms.");
    }
};

export const generateDiagnosticQuestions = async (diseaseName: string): Promise<Question[]> => {
    try {
        const prompt = `Crée un questionnaire de 5 questions Oui/Non pour aider à évaluer rapidement le terrain d'une personne atteinte de "${diseaseName}". Les questions doivent être simples et directes.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: questionListSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating diagnostic questions:", error);
        throw new Error("Failed to generate diagnostic questions.");
    }
};

export const generatePersonalizedPlan = async (diseaseName: string, answers: { question: string, answer: boolean }[]): Promise<PersonalizedPlan> => {
    try {
        const answersString = answers.map(a => `- ${a.question}: ${a.answer ? 'Oui' : 'Non'}`).join('\n');
        const prompt = `Basé sur les réponses suivantes pour une personne atteinte de "${diseaseName}":\n${answersString}\n\nGénère un plan d'action personnalisé.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Tu es un assistant en nutrition holistique. Tu ne donnes JAMAIS de conseils médicaux. Tes réponses doivent être encourageantes et informatives, en te concentrant uniquement sur l'alimentation. Chaque analyse doit inclure un avertissement clair de consulter un professionnel de santé. Le ton doit être bienveillant et éducatif.",
                responseMimeType: 'application/json',
                responseSchema: personalizedPlanSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating personalized plan:", error);
        throw new Error("Failed to generate personalized plan.");
    }
};