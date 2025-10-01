import React, { useState, useEffect } from 'react';
import type { Disease, Question } from '../types';
import { generateDiagnosticQuestions } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import Disclaimer from './Disclaimer';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  disease: Disease;
  onSubmit: (answers: { question: string, answer: boolean }[]) => void;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ isOpen, onClose, disease, onSubmit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setIsLoading(true);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestionIndex(0);

      const fetchQuestions = async () => {
        try {
          const fetchedQuestions = await generateDiagnosticQuestions(disease.name);
          setQuestions(fetchedQuestions);
        } catch (error) {
          console.error(error);
          alert("Erreur lors du chargement des questions. Veuillez réessayer.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [isOpen, disease.name, onClose]);

  if (!isOpen) return null;

  const handleAnswer = (questionId: string, answer: boolean) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = questions.map(q => ({
        question: q.text,
        answer: answers[q.id] ?? false // Default to false if unanswered, though UI prevents this
    }));
    onSubmit(formattedAnswers);
  };
  
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg text-center shadow-2xl flex flex-col" style={{minHeight: '400px'}}>
        <h2 className="text-2xl font-bold text-brand-text dark:text-white mb-4">Analyse Rapide : {disease.name}</h2>
        <Disclaimer className="mb-4"/>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : questions.length > 0 && !allQuestionsAnswered ? (
          <div className="flex-grow flex flex-col justify-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">Question {currentQuestionIndex + 1} / {questions.length}</p>
            <p className="text-xl font-semibold mb-8 min-h-[60px]">{questions[currentQuestionIndex].text}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleAnswer(questions[currentQuestionIndex].id, true)}
                className="w-32 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                Oui
              </button>
              <button
                onClick={() => handleAnswer(questions[currentQuestionIndex].id, false)}
                className="w-32 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                Non
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center">
            <p className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Questionnaire terminé !</p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Prêt à découvrir votre plan d'action personnalisé ?</p>
            <button
              onClick={handleSubmit}
              className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Générer mon Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireModal;
