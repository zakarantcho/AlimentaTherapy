import React, { useState, useEffect, useMemo } from 'react';
import type { Disease, AdherenceEntry } from '../types';
import HistoryChart from './HistoryChart';

interface AdherenceTrackerProps {
  disease: Disease;
}

const StarIcon: React.FC<{ filled: boolean; onClick: () => void; isHovered: boolean }> = ({ filled, onClick, isHovered }) => (
  <svg
    onClick={onClick}
    className={`w-8 h-8 cursor-pointer transition-all duration-150 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'} ${isHovered ? 'scale-125' : 'scale-100'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const AdherenceTracker: React.FC<AdherenceTrackerProps> = ({ disease }) => {
  const storageKey = `adherence_tracker_${disease.id}`;
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [entries, setEntries] = useState<AdherenceEntry[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Load entries from localStorage
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(storageKey);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to load adherence entries from localStorage", error);
    }
  }, [storageKey]);

  // Sync form with today's entry if it exists
  useEffect(() => {
    const todayEntry = entries.find(e => e.date === getTodayDateString());
    if (todayEntry) {
        setRating(todayEntry.rating);
        setNotes(todayEntry.notes);
    } else {
        setRating(0);
        setNotes('');
    }
  }, [entries]);

  // Save entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save adherence entries to localStorage", error);
    }
  }, [entries, storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Veuillez sélectionner une note pour votre journée.");
      return;
    }

    const today = getTodayDateString();
    const existingEntryIndex = entries.findIndex(entry => entry.date === today);

    let updatedEntries;
    if (existingEntryIndex > -1) {
      // Update today's entry
      updatedEntries = [...entries];
      updatedEntries[existingEntryIndex] = { ...updatedEntries[existingEntryIndex], rating, notes };
    } else {
      // Add a new entry
      const newEntry: AdherenceEntry = {
        id: new Date().toISOString() + Math.random(),
        date: today,
        rating,
        notes: notes.trim(),
      };
      updatedEntries = [newEntry, ...entries];
    }
    setEntries(updatedEntries.sort((a, b) => b.date.localeCompare(a.date)));
    alert("Entrée enregistrée !");
  };

  const todayEntryExists = useMemo(() => entries.some(e => e.date === getTodayDateString()), [entries]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700">
      <h3 className="text-xl font-bold text-brand-text dark:text-gray-100 mb-4">Suivi de l'Adhésion au Plan</h3>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment avez-vous suivi votre plan aujourd'hui ?
          </label>
          <div className="flex items-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} onMouseEnter={() => setHoverRating(level)}>
                <StarIcon
                  filled={level <= (hoverRating || rating)}
                  onClick={() => setRating(level)}
                  isHovered={level <= hoverRating}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="adherence-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optionnel)
          </label>
          <input
            id="adherence-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: J'ai essayé une nouvelle recette..."
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-brand-green focus:border-brand-green"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-light text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {todayEntryExists ? "Mettre à jour l'entrée" : "Enregistrer la journée"}
        </button>
      </form>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <h4 className="text-lg font-semibold text-brand-text dark:text-gray-200 mb-3">Évolution Récente</h4>
        <HistoryChart entries={entries} title="Adhésion au plan (14 derniers jours)" color="#3B82F6" fixedYScale={{ min: 1, max: 5 }} />

        <h4 className="text-lg font-semibold text-brand-text dark:text-gray-200 mb-3 border-t border-gray-200 dark:border-gray-600 pt-4">Historique Complet</h4>
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucune entrée enregistrée pour le moment.</p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {entries.map(entry => (
              <li key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                       {new Date(entry.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-1">"{entry.notes || 'Aucune note'}"</p>
                  </div>
                   <div className="flex items-center flex-shrink-0 ml-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < entry.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdherenceTracker;