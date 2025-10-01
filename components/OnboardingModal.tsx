
import React from 'react';
import { DISEASES } from '../constants';
import type { Disease } from '../types';
import Disclaimer from './Disclaimer';

interface OnboardingModalProps {
  isOpen: boolean;
  onSelect: (disease: Disease) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-brand-text dark:text-white mb-2">Bienvenue sur NutriHeal</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Votre assistant nutritionnel pour une guérison ciblée.</p>
        <p className="text-xl font-semibold text-brand-text dark:text-gray-100 mb-6">Pour commencer, sélectionnez votre objectif principal :</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {DISEASES.map((disease) => (
            <button
              key={disease.id}
              onClick={() => onSelect(disease)}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-brand-green-light/20 dark:hover:bg-brand-green-light/20 border border-transparent hover:border-brand-green transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mr-4 flex-shrink-0">
                {disease.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-brand-text dark:text-white">{disease.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{disease.description}</p>
              </div>
            </button>
          ))}
        </div>
        
        <Disclaimer />
      </div>
    </div>
  );
};

export default OnboardingModal;
