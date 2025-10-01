import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 p-4 mt-auto text-center text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
      <p className="text-sm font-semibold">Publicité</p>
      <p className="text-xs">Sponsorisé : Découvrez nos compléments bio pour une santé optimale !</p>
    </div>
  );
};

export default AdBanner;