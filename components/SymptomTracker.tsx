import React, { useState, useEffect } from 'react';
import type { Disease, SymptomEntry } from '../types';
import { generateCommonSymptoms } from '../services/geminiService';
import HistoryChart from './HistoryChart';

interface SymptomTrackerProps {
  disease: Disease;
}

const severityColors = [
  'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200', // 1
  'bg-lime-200 text-lime-800 dark:bg-lime-700 dark:text-lime-200',   // 2
  'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',// 3
  'bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-200',// 4
  'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200',     // 5
];

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ disease }) => {
  const storageKey = `symptom_tracker_${disease.id}`;
  
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<number>(3);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(storageKey);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to load symptom entries from localStorage", error);
    }
  }, [storageKey]);
  
  // Fetch common symptoms when disease changes
  useEffect(() => {
    const fetchSymptoms = async () => {
      setIsLoadingSymptoms(true);
      try {
        const symptoms = await generateCommonSymptoms(disease.name);
        setCommonSymptoms(symptoms);
      } catch (error) {
        console.error("Failed to fetch common symptoms", error);
        setCommonSymptoms([]); // Set empty on error
      } finally {
        setIsLoadingSymptoms(false);
      }
    };
    fetchSymptoms();
  }, [disease.name]);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save symptom entries to localStorage", error);
    }
  }, [entries, storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Veuillez entrer une description du symptôme.");
      return;
    }

    const newEntry: SymptomEntry = {
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      severity,
    };

    setEntries(prevEntries => [newEntry, ...prevEntries].sort((a,b) => b.date.localeCompare(a.date)));
    setDescription('');
    setSeverity(3);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700">
      <h3 className="text-xl font-bold text-brand-text dark:text-gray-100 mb-4">Journal des Symptômes</h3>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions rapides</label>
          {isLoadingSymptoms ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des suggestions...</p>
          ) : commonSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDescription(symptom)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-sm rounded-full hover:bg-brand-green hover:text-white dark:hover:bg-brand-green-light transition-colors"
                >
                  {symptom}
                </button>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500 dark:text-gray-400">Aucune suggestion disponible.</p>}
        </div>

        <div>
          <label htmlFor="symptom-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ou décrivez un autre symptôme
          </label>
          <input
            id="symptom-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: 'Douleur au genou', 'Fatigue matinale'..."
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-brand-green focus:border-brand-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sévérité (1: Très faible, 5: Très forte)
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`w-10 h-10 rounded-full font-bold transition-transform duration-150 ${severity === level ? 'ring-2 ring-brand-green scale-110' : 'hover:scale-105'} ${severityColors[level - 1]}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-light text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Ajouter au journal
        </button>
      </form>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <h4 className="text-lg font-semibold text-brand-text dark:text-gray-200 mb-3">Évolution Récente</h4>
        <HistoryChart entries={entries} title="Sévérité des symptômes (14 derniers jours)" color="#EF4444" fixedYScale={{ min: 1, max: 5 }} />

        <h4 className="text-lg font-semibold text-brand-text dark:text-gray-200 mb-3 border-t border-gray-200 dark:border-gray-600 pt-4">Historique Complet</h4>
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucun symptôme enregistré pour le moment.</p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {entries.map(entry => (
              <li key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{entry.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className={`px-3 py-1 text-sm font-bold rounded-full ${severityColors[entry.severity - 1]}`}>
                  {entry.severity}/5
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SymptomTracker;