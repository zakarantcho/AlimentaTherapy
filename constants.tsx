import React from 'react';
import type { Disease } from './types';

// Updated, more descriptive icons

// A blood drop for diabetes, more specific than a generic medical cross.
const DiabetesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 117.5-6.566 5 5 0 117.5 6.566z" />
    </svg>
);

// A stylized joint with inflammation markers, clearer than two abstract circles.
const ArthritisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3m0 9v3m-4.5-9H3m18 0h-4.5m-9 4.5l-3 3m15-3l-3-3m-9 0l3-3m0 6l3 3" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// A clearer, more recognizable stomach icon.
const DigestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14.5c0 3.59 2.91 6.5 6.5 6.5H12c3.59 0 6.5-2.91 6.5-6.5v-5C18.5 5.91 15.59 3 12 3h-.5C7.91 3 5 5.91 5 9.5v5z" />
  </svg>
);

// The existing heart icon is excellent and descriptive.
const HypertensionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m-3-3l3 3-3 3m12-6l-3 3 3 3" />
    </svg>
);

// A low battery icon, universally understood for low energy/fatigue.
const FatigueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75v.375A2.375 2.375 0 0118.625 15H3.375A2.375 2.375 0 011 12.625v-1.25A2.375 2.375 0 013.375 9h15.25A2.375 2.375 0 0121 11.375v.375M22.5 12h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h2" fill="currentColor" stroke="currentColor"/>
  </svg>
);


export const DISEASES: Disease[] = [
  { id: 'diabetes', name: 'Diabète Type 2', description: 'Gérer la glycémie et améliorer la sensibilité à l\'insuline.', icon: <DiabetesIcon /> },
  { id: 'arthritis', name: 'Arthrite', description: 'Réduire l\'inflammation et soulager les douleurs articulaires.', icon: <ArthritisIcon /> },
  { id: 'digestion', name: 'Troubles Digestifs (MICI)', description: 'Apaiser le système digestif et restaurer le microbiote.', icon: <DigestionIcon /> },
  { id: 'hypertension', name: 'Hypertension', description: 'Soutenir la santé cardiovasculaire et réguler la pression.', icon: <HypertensionIcon /> },
  { id: 'fatigue', name: 'Fatigue Surrénale', description: 'Booster l\'énergie et équilibrer les hormones de stress.', icon: <FatigueIcon /> },
];

export const MEDICAL_DISCLAIMER = "Ceci n’est pas un conseil médical. Consultez un médecin. L’app ne diagnostique ni ne traite.";
