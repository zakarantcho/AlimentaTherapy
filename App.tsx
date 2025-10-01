import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  generateInitialContent,
  generateFoodDetails,
  generatePremiumRecipe,
  generateImage,
  generatePersonalizedPlan
} from './services/geminiService';
import type { Disease, Food, Recipe, GeneratedContent, View, Source, PersonalizedPlan } from './types';
import OnboardingModal from './components/OnboardingModal';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import RewardedAdModal from './components/RewardedAdModal';
import Disclaimer from './components/Disclaimer';
import AdBanner from './components/AdBanner';
import SymptomTracker from './components/SymptomTracker';
import AdherenceTracker from './components/AdherenceTracker';
import QuestionnaireModal from './components/QuestionnaireModal';
import DataSources from './components/DataSources';
import { DISEASES } from './constants';

type Theme = 'light' | 'dark';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Food Icons
const FishIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12.5c.94-3.46 4.94-6 9.5-6 4.56 0 8.56 2.54 9.5 6-.94 3.46-4.94 6-9.5 6-4.56 0-8.56-2.54-9.5-6z"/><path d="M18.5 12.5v.5"/><path d="M6 12.5l-4 2v-4l4 2z"/></svg>);
const LeafIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4-2 6-6 6-10s-2-8-6-8-6 4-6 10 2 8 6 10z"/></svg>);
const FruitIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.28 10.28A10 10 0 1 0 3.72 10.28"/><path d="M12 2a2.39 2.39 0 0 0-2.39 2.39V6.5h4.78V4.39A2.39 2.39 0 0 0 12 2z"/></svg>);
const SeedIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="16.5" cy="7.5" r="1.5"/><circle cx="7.5" cy="16.5" r="1.5"/></svg>);
const SpiceIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h-2"/><path d="m17.66 17.66-1.41-1.41"/><path d="M12 22v-2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M4 12H2"/><path d="m6.34 6.34 1.41-1.41"/><circle cx="12" cy="12" r="3"/></svg>);
const RootVeggieIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l10 10L22 12 12 2 2 12z"/><path d="M7 7l5 5 5-5M7 17v-5l5 5 5-5v5"/></svg>);
const DefaultFoodIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M20.59 12c-.38-.9-1.22-3-4.59-6.39S12 2 12 2s-3.78 3.61-7 6.61C1.63 12.22 1 14.1 1 16a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2c0-1.9-.63-3.78-2.41-6.39z"/></svg>);

const getFoodIcon = (foodName: string): React.ReactNode => {
    const lowerCaseName = foodName.toLowerCase();
    
    if (['saumon', 'maquereau', 'poisson', 'sardine'].some(keyword => lowerCaseName.includes(keyword))) {
        return <FishIcon />;
    }
    if (['patate douce', 'pomme de terre', 'courge', 'butternut', 'carotte', 'panais'].some(keyword => lowerCaseName.includes(keyword))) {
        return <RootVeggieIcon />;
    }
    if (['brocoli', 'épinard', 'kale', 'légume', 'asperge', 'chou', 'salade'].some(keyword => lowerCaseName.includes(keyword))) {
        return <LeafIcon />;
    }
    if (['ananas', 'banane', 'baie', 'fruit', 'pomme', 'orange', 'citron', 'grenade'].some(keyword => lowerCaseName.includes(keyword))) {
        return <FruitIcon />;
    }
    if (['noix', 'amande', 'graine', 'chia', 'lin', 'quinoa', 'lentille', 'orge', 'sésame'].some(keyword => lowerCaseName.includes(keyword))) {
        return <SeedIcon />;
    }
    if (['curcuma', 'gingembre', 'épice', 'herbe', 'ail', 'romarin', 'menthe', 'persil', 'aneth'].some(keyword => lowerCaseName.includes(keyword))) {
        return <SpiceIcon />;
    }
    
    return <DefaultFoodIcon />;
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adRewardCallback, setAdRewardCallback] = useState<(() => void) | null>(null);
  
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [recipeFilter, setRecipeFilter] = useState<string | null>(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [isRecipeDiseaseModalOpen, setIsRecipeDiseaseModalOpen] = useState(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  const handleSelectDisease = useCallback(async (disease: Disease) => {
    setView('loading');
    setSelectedDisease(disease);
    setRecipeFilter(disease.id);
    try {
      const initialContent = await generateInitialContent(disease);
      setContent(initialContent);
      setView('dashboard');
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors du chargement du contenu. Veuillez réessayer.");
      setView('welcome');
    }
  }, []);

  const fetchImage = useCallback(async (key: string, prompt: string) => {
    if (imageUrls[key] || loadingStates[key]) return;
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      const url = await generateImage(prompt);
      setImageUrls(prev => ({ ...prev, [key]: url }));
    } catch (error) {
      console.error(`Failed to generate image for ${key}`, error);
      // Fallback is handled in geminiService
      const fallbackUrl = `https://picsum.photos/512?random=${Math.random()}`;
      setImageUrls(prev => ({ ...prev, [key]: fallbackUrl }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, [imageUrls, loadingStates]);
  
  useEffect(() => {
    if (content) {
        // Generate images for key foods with more descriptive and artistic prompts
        content.foods.forEach(food => {
            const imagePrompt = `Photographie culinaire de ${food.name.toLowerCase()} en tant qu'ingrédient principal. Mettre l'accent sur sa texture et sa couleur naturelle, présenté de manière simple et élégante.`;
            fetchImage(`food_${food.name}`, imagePrompt);
        });

        // Generate images for therapeutic recipes with context-aware prompts
        content.recipes.forEach(recipe => {
            let imagePrompt: string;
            const title = recipe.title;

            // Highly detailed, artistic prompts for the curated inflammation recipes
            if (title.includes("Smoothie 'Élixir Doré'")) {
                imagePrompt = "Photographie culinaire de style éditorial. Un smoothie 'Élixir Doré' au curcuma, d'un jaune-orangé intense et vibrant, servi dans un verre élégant et haut. De la condensation perle sur le verre froid. Garni méticuleusement avec une spirale de zeste d'orange et une feuille de menthe parfaite. L'arrière-plan est flou (faible profondeur de champ), suggérant une cuisine lumineuse et aérée avec des morceaux de gingembre frais et d'ananas posés nonchalamment sur une surface en marbre blanc. La lumière est naturelle, douce et venant de côté, accentuant la texture du smoothie.";
            } else if (title.includes("Saumon Bio Rôti")) {
                imagePrompt = "Photographie culinaire dramatique. Un pavé de saumon bio rôti, la peau est incroyablement croustillante et dorée, avec des flocons de sel marin visibles. Le saumon est servi sur un lit de quinoa coloré (rouge, blanc, noir). À côté, des bouquets de brocoli rôtis ont des pointes légèrement carbonisées. Un filet de vapeur s'élève du plat chaud. L'assiette est une céramique artisanale de couleur ardoise mate. Un quartier de citron juteux est à moitié pressé, une gouttelette suspendue. L'éclairage est directionnel et faible (style clair-obscur) pour mettre en valeur les textures brillantes du poisson et les couleurs profondes des légumes.";
            } else if (title.includes("Velouté Réconfortant")) {
                imagePrompt = "Photographie culinaire chaleureuse et réconfortante. Un bol en terre cuite rempli d'un velouté de patate douce et carotte, d'une couleur orange intense et veloutée. La surface est ornée d'un tourbillon artistique de lait de coco et de quelques gouttes d'huile de chili pour le contraste. Une pincée de graines de courge grillées et de persil frais haché est saupoudrée au centre. Une légère vapeur monte du bol. La photo est prise légèrement en plongée pour capturer la profondeur. En arrière-plan, une cuillère en bois rustique repose sur une nappe en lin. L'ambiance est cosy, avec une lumière chaude et douce.";
            } else if (title.includes("Bol Bouddha Énergisant")) {
                imagePrompt = "Photographie culinaire vue de dessus d'un bol Bouddha vibrant et coloré. Dans un grand bol en céramique blanche, on voit des sections bien définies de lentilles noires béluga, de dés de patate douce rôtie et caramélisée, de kale vert foncé massé, et de chou rouge émincé. Un filet généreux de sauce tahini crémeuse au citron est versé sur le dessus. Le bol est garni de graines de sésame noir et blanc. Lumière naturelle et vive, fond en marbre clair.";
            } else if (title.includes("Filet de Maquereau Grillé")) {
                imagePrompt = "Photographie culinaire élégante d'un filet de maquereau grillé, la peau argentée et striée de marques de grill. Le poisson est posé sur une cuillerée de purée de panais blanche et lisse, parsemée de romarin frais haché. À côté, quelques asperges vertes croquantes, parfaitement alignées. L'assiette est sombre, style ardoise, pour un contraste dramatique. Éclairage latéral doux qui met en valeur les textures.";
            } else if (title.includes("Infusion Glacée Apaisante")) {
                imagePrompt = "Une grande carafe en verre remplie d'une infusion glacée d'un rouge rubis profond à l'hibiscus. Des baies de goji rouges flottent parmi des glaçons cristallins et des feuilles de menthe fraîche et verte. De la condensation perle sur le verre. En arrière-plan, une lumière d'été douce filtre à travers une fenêtre, créant une atmosphère rafraîchissante et sereine. Le style est lumineux et minimaliste.";
            } else {
                // Fallback for other generated recipes
                const lowerCaseTitle = title.toLowerCase();
                 if (lowerCaseTitle.includes('smoothie')) {
                    imagePrompt = `"${title}", une boisson saine et vibrante dans un verre, avec des ingrédients frais à côté.`;
                } else if (lowerCaseTitle.includes('velouté') || lowerCaseTitle.includes('soupe')) {
                    imagePrompt = `"${title}", une soupe réconfortante et crémeuse dans un bol, joliment garnie.`;
                } else {
                    imagePrompt = `"${title}", un plat sain et thérapeutique joliment présenté dans une assiette.`;
                }
            }
            fetchImage(`recipe_${recipe.title}`, imagePrompt);
        });
    }
  }, [content, fetchImage]);


  const handleShowDetails = useCallback(async (food: Food) => {
    setModalContent({ title: food.name, content: <LoadingSpinner /> });
    setIsModalOpen(true);
    try {
      const { details, sources } = await generateFoodDetails(food.name, selectedDisease!.name);
      const sourcesElement = sources.length > 0 && (
        <div className="mt-4 pt-4 border-t dark:border-gray-600">
          <h4 className="font-bold text-md mb-2">Sources :</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {sources.map((source: Source, index: number) => (
              <li key={index}><a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{source.web?.title}</a></li>
            ))}
          </ul>
        </div>
      );
      setModalContent({ title: food.name, content: <><p className="whitespace-pre-wrap">{details}</p>{sourcesElement}</> });
    } catch (error) {
      console.error(error);
      setModalContent({ title: food.name, content: <p className="text-red-500">Erreur lors du chargement des détails.</p> });
    }
  }, [selectedDisease]);

  const startGenerateRecipeFlow = useCallback((diseaseForRecipe: Disease) => {
    const callback = async () => {
      setIsAdModalOpen(false);
      setView('loading');
      try {
        const newRecipe = await generatePremiumRecipe(diseaseForRecipe, content?.foods.map(f => f.name) || []);
        setContent(prev => {
          if (!prev) return null;
          // Avoid adding duplicates
          if (prev.recipes.some(r => r.title === newRecipe.title)) {
            return prev;
          }
          return { ...prev, recipes: [...prev.recipes, newRecipe] };
        });
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la génération de la recette.");
      } finally {
        setView('dashboard');
      }
    };
    setAdRewardCallback(() => callback);
    setIsAdModalOpen(true);
  }, [content]);
  
  const handleQuestionnaireSubmit = useCallback(async (answers: { question: string, answer: boolean }[]) => {
      setIsQuestionnaireOpen(false);
      setView('loading');
      try {
          const plan = await generatePersonalizedPlan(selectedDisease!.name, answers);
          setPersonalizedPlan(plan);
          setModalContent({ title: "Votre Plan Personnalisé", content: (
              <div>
                  <h3 className="text-lg font-bold mb-2">Analyse</h3>
                  <p className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">{plan.analysis}</p>
                  <h3 className="text-lg font-bold mb-2">Ordonnance Alimentaire</h3>
                  <p className="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-md whitespace-pre-wrap">{plan.prescription}</p>
                  <h3 className="text-lg font-bold mb-2">Explication</h3>
                  <p className="p-3 bg-blue-100 dark:bg-blue-900 rounded-md">{plan.explanation}</p>
              </div>
          )});
          setIsModalOpen(true);
      } catch (error) {
          console.error("Failed to generate personalized plan", error);
          alert("Erreur lors de la génération de votre plan personnalisé.");
      } finally {
          setView('dashboard');
      }
  }, [selectedDisease]);

  const renderDashboard = () => {
    if (!selectedDisease || !content) return null;

    const availableRecipeFilters = Array.from(new Set(content.recipes.map(r => r.diseaseId)));

    const filteredFoods = content.foods.filter(food => 
        food.name.toLowerCase().includes(foodSearchQuery.toLowerCase().trim())
    );

    const filteredRecipes = content.recipes.filter(recipe => {
        // Filter by disease category first
        const categoryMatch = !recipeFilter || recipeFilter === 'all' || recipe.diseaseId === recipeFilter;
        if (!categoryMatch) return false;

        // Then filter by search query
        if (!recipeSearchQuery) return true; // No search query, so it's a match

        const query = recipeSearchQuery.toLowerCase().trim();
        const titleMatch = recipe.title.toLowerCase().includes(query);
        const ingredientsMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(query));

        return titleMatch || ingredientsMatch;
    });

    return (
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <header className="text-center relative">
          <h1 className="text-4xl font-extrabold text-brand-text dark:text-white">Votre Guide pour <span className="text-brand-green">{selectedDisease.name}</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{selectedDisease.description}</p>
            <button
                onClick={toggleTheme}
                className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
        </header>

        <section id="plan-personnalise" className="bg-brand-orange/10 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-brand-orange mb-2">Obtenez un Plan d'Action Personnalisé !</h2>
            <p className="text-brand-text dark:text-gray-200 mb-4">Répondez à quelques questions rapides pour recevoir des recommandations sur mesure.</p>
            <button onClick={() => setIsQuestionnaireOpen(true)} className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Commencer l'Analyse
            </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SymptomTracker disease={selectedDisease} />
            <AdherenceTracker disease={selectedDisease} />
        </div>

        <DataSources disease={selectedDisease} />

        <section id="aliments">
          <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-4">Aliments Clés</h2>
           <div className="relative w-full max-w-lg mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Rechercher un aliment..."
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border rounded-full text-brand-text dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-brand-green-light focus:border-brand-green-light transition"
              />
            </div>
          
          {filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredFoods.map((food, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {loadingStates[`food_${food.name}`] ? <LoadingSpinner/> : <img src={imageUrls[`food_${food.name}`]} alt={food.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-brand-text dark:text-white flex items-center gap-2 mb-1">
                        {getFoodIcon(food.name)}
                        <span className="flex-1">{food.name}</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow mb-4">{food.summary}</p>
                      <button onClick={() => handleShowDetails(food)} className="mt-auto w-full bg-brand-green-light text-brand-text font-semibold py-2 px-4 rounded-lg hover:bg-brand-green hover:text-white transition-colors text-sm">
                        En savoir plus
                      </button>
                    </div>
                  </div>
                ))}
            </div>
           ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Aucun aliment trouvé pour "{foodSearchQuery}".
                </p>
           )}
        </section>

        <section id="recettes">
          <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-4">Recettes Thérapeutiques</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:flex-grow max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Rechercher par titre ou ingrédient..."
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border rounded-full text-brand-text dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-brand-green-light focus:border-brand-green-light transition"
              />
            </div>
            <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setRecipeFilter('all')} 
                  className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${recipeFilter === 'all' || !recipeFilter ? 'bg-brand-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Toutes
                </button>
                {DISEASES.filter(d => availableRecipeFilters.includes(d.id)).map(disease => (
                  <button 
                    key={disease.id}
                    onClick={() => setRecipeFilter(disease.id)}
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${recipeFilter === disease.id ? 'bg-brand-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {disease.name}
                  </button>
                ))}
            </div>
          </div>
          <div className="space-y-8">
            {filteredRecipes.length > 0 ? filteredRecipes.map((recipe, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden lg:flex">
                <div className="lg:w-1/3 h-64 lg:h-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                   {loadingStates[`recipe_${recipe.title}`] ? (
                     <LoadingSpinner />
                   ) : (
                     <img src={imageUrls[`recipe_${recipe.title}`]} alt={recipe.title} className="w-full h-full object-cover" />
                   )}
                </div>
                <div className="p-6 lg:p-8 lg:w-2/3">
                  <h3 className="font-bold text-2xl text-brand-text dark:text-white mb-4">{recipe.title}</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-bold text-lg text-brand-text dark:text-gray-200 mb-2">Bienfaits Thérapeutiques</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-4 border-brand-green-light pl-4 py-2">{recipe.benefits}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-brand-text dark:text-gray-200 mb-2">Ingrédients</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-brand-text dark:text-gray-200 mb-2">Instructions</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {recipeSearchQuery 
                  ? `Aucune recette trouvée pour "${recipeSearchQuery}".`
                  : 'Aucune recette ne correspond à ce filtre.'
                }
              </p>
            )}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => setIsRecipeDiseaseModalOpen(true)} className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
              Débloquer une Nouvelle Recette
            </button>
          </div>
        </section>
        
        <div className="pt-8 mt-8 border-t dark:border-gray-700">
            <AdBanner />
            <Disclaimer className="mt-4" />
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch(view) {
      case 'welcome':
        return <OnboardingModal isOpen={true} onSelect={handleSelectDisease} />;
      case 'loading':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
              <LoadingSpinner />
              <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Préparation de votre guide personnalisé...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                L'IA analyse les meilleures stratégies nutritionnelles pour {selectedDisease?.name || 'vous'}.
              </p>
          </div>
        );
      case 'dashboard':
        return renderDashboard();
      default:
        return <p>État inconnu</p>;
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      {renderContent()}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent?.title || ''}>
        {modalContent?.content}
      </Modal>
      <RewardedAdModal 
        isOpen={isAdModalOpen} 
        onClose={() => setIsAdModalOpen(false)} 
        onReward={() => adRewardCallback && adRewardCallback()}
        title="1 Nouvelle Recette Premium"
      />
      {selectedDisease && (
          <QuestionnaireModal 
            isOpen={isQuestionnaireOpen}
            onClose={() => setIsQuestionnaireOpen(false)}
            disease={selectedDisease}
            onSubmit={handleQuestionnaireSubmit}
          />
      )}
      <Modal 
        isOpen={isRecipeDiseaseModalOpen} 
        onClose={() => setIsRecipeDiseaseModalOpen(false)} 
        title="Générer une recette pour..."
      >
        <div className="flex flex-col space-y-3">
          {DISEASES.map(disease => (
            <button
              key={disease.id}
              onClick={() => {
                setIsRecipeDiseaseModalOpen(false);
                startGenerateRecipeFlow(disease);
              }}
              className="w-full text-left p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-brand-green-light/20 dark:hover:bg-brand-green-light/20 transition-colors flex items-center"
            >
              <span className="mr-4">{disease.icon}</span>
              <span className="font-semibold text-brand-text dark:text-gray-100">{disease.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </main>
  );
};

export default App;