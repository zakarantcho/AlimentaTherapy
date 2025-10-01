import React, { useEffect, useState } from 'react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
  title: string;
}

const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ isOpen, onClose, onReward, title }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: number;
    if (isOpen && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isOpen && countdown === 0) {
      onReward();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, onReward]);
  
  useEffect(() => {
    if (isOpen) {
        setCountdown(5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-center shadow-2xl">
        <h2 className="text-xl font-bold text-brand-text dark:text-white mb-2">Débloquer du Contenu Premium</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Regardez une courte publicité pour débloquer : <span className="font-semibold">{title}</span></p>
        <div className="bg-gray-800 dark:bg-black text-white h-48 flex items-center justify-center rounded-md mb-4">
          <p>Vidéo publicitaire en cours...</p>
        </div>
        {countdown > 0 ? (
          <button
            disabled
            className="w-full bg-gray-400 dark:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed"
          >
            Récompense dans {countdown}...
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full bg-brand-green hover:bg-brand-green-light text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardedAdModal;