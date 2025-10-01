import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Disease, ExternalHealthData } from '../types';
import HistoryChart from './HistoryChart';

const GoogleFitIcon: React.FC = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.93 5.50005L11.958 5.52705L15.304 8.87405L15.321 8.89105L18.496 5.71605L18.513 5.70005L15.939 3.12505C14.735 1.92105 12.804 1.92105 11.6 3.12505L9.444 5.28105L11.93 7.76705V5.50005Z" fill="#34A853"/>
        <path d="M5.708 18.521L3.134 15.947C1.93 14.743 1.93 12.812 3.134 11.608L5.29 9.45205L7.776 11.938L5.509 14.205L8.883 17.579L11.93 14.532L14.206 16.808L11.6 19.412C10.396 20.616 8.465 20.616 7.261 19.412L5.708 17.859V18.521Z" fill="#4285F4"/>
        <path d="M19.404 11.599C20.608 12.803 20.608 14.734 19.404 15.938L16.807 18.535L14.531 16.259L17.587 13.212L14.213 9.83805L11.937 12.115L9.451 9.62905L11.607 7.47305L13.849 9.71505L15.312 8.25205L11.947 4.88705L11.93 4.87005V7.75805L15.903 11.731L15.895 11.723L18.503 14.331L18.52 14.314L19.404 13.43V11.599Z" fill="#EA4335"/>
        <path d="M19.412 11.6079L18.52 10.7159L15.706 13.5299L16.808 14.6319L19.412 12.0279C20.616 10.8239 20.616 8.89291 19.412 7.68891L16.838 5.11491L14.242 7.71191L15.705 9.17491L13.849 11.0309L11.93 9.11191L7.784 13.2579L9.147 14.6209L11.93 11.8389L14.224 14.1329L11.637 16.7199L11.62 16.7369L14.194 19.3109C15.398 20.5149 17.329 20.5149 18.533 19.3109L20.871 16.9729L19.412 15.5099V11.6079Z" fill="#FBBC05"/>
    </svg>
);

const AppleHealthIcon: React.FC = () => (
    <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

// MyFitnessPal Icon - representing nutrition and exercise tracking with a stylized dumbbell
const MyFitnessPalIcon: React.FC = () => (
    <svg className="w-8 h-8 text-sky-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 6.5h-4.5v-1c0-.8-.7-1.5-1.5-1.5H14V2.5c0-.8-.7-1.5-1.5-1.5S11 1.7 11 2.5V4h-2V2.5c0-.8-.7-1.5-1.5-1.5S6 1.7 6 2.5V4H4.5c-.8 0-1.5.7-1.5 1.5v1H2c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h1v4h-1c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h1v1c0 .8.7 1.5 1.5 1.5H6v1.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V20h2v1.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V20h1.5c.8 0 1.5-.7 1.5-1.5v-1H22c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5h-1v-4h1c.8 0 1.5-.7 1.5-1.5S22.8 6.5 22 6.5zm-4.5 9h-11v-4h11v4z"/>
    </svg>
);

// Fitbit Icon - using their brand color and a simplified logo feel
const FitbitIcon: React.FC = () => (
    <svg className="w-8 h-8 text-teal-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.47 10.43c-1.12 0-2.03.9-2.03 2.02s.9 2.02 2.03 2.02 2.03-.9 2.03-2.02-.91-2.02-2.03-2.02zm4.1 0c-1.12 0-2.03.9-2.03 2.02s.9 2.02 2.03 2.02 2.03-.9 2.03-2.02-.9-2.02-2.03-2.02zm-2.05 4.12c-1.13 0-2.03.9-2.03 2.02s.9 2.02 2.03 2.02 2.03-.9 2.03-2.02c0-1.12-.9-2.02-2.03-2.02zm4.11 0c-1.13 0-2.03.9-2.03 2.02s.9 2.02 2.03 2.02 2.03-.9 2.03-2.02c0-1.12-.9-2.02-2.03-2.02zm4.1-4.1c-1.12 0-2.03.9-2.03 2.02s.91 2.02 2.03 2.02 2.03-.9 2.03-2.02-.9-2.02-2.03-2.02zm0 4.12c-1.12 0-2.03.9-2.03 2.02s.91 2.02 2.03 2.02 2.03-.9 2.03-2.02-.9-2.02-2.03-2.02z"/>
    </svg>
);

const CsvIcon: React.FC = () => (
    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12.55V12C2 7.28 2 4.92 3.46 3.46C4.92 2 7.28 2 12 2C16.72 2 19.08 2 20.54 3.46C22 4.92 22 7.28 22 12V12.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 16.73V20.5C11 21.88 10.3 22 9 22H7.2C5.9 22 5.2 21.88 5.2 20.5V16.73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 16.73V20.5C19 21.88 18.3 22 17 22H15.2C13.9 22 13.2 21.88 13.2 20.5V16.73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.25 16.73C5.55 16.27 5.97 15.87 6.47 15.57C7.64 14.88 9.16 14.88 10.33 15.57C10.83 15.87 11 16.27 11 16.73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.25 16.73C13.55 16.27 13.97 15.87 14.47 15.57C15.64 14.88 17.16 14.88 18.33 15.57C18.83 15.87 19 16.27 19 16.73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 7H14.5M9.5 10H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

const CheckCircleIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DataSources: React.FC<{ disease: Disease }> = ({ disease }) => {
  const csvStorageKey = `external_data_csv_${disease.id}`;
  const fitbitConnectedKey = `fitbit_connected_${disease.id}`;
  const myFitnessPalConnectedKey = `myfitnesspal_connected_${disease.id}`;
  
  const [csvData, setCsvData] = useState<ExternalHealthData[]>([]);
  const [fitbitData, setFitbitData] = useState<ExternalHealthData[]>([]);
  const [myFitnessPalData, setMyFitnessPalData] = useState<ExternalHealthData[]>([]);
  
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [isConnectingFitbit, setIsConnectingFitbit] = useState(false);

  const [isMyFitnessPalConnected, setIsMyFitnessPalConnected] = useState(false);
  const [isConnectingMyFitnessPal, setIsConnectingMyFitnessPal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedCsvData = localStorage.getItem(csvStorageKey);
      if (storedCsvData) setCsvData(JSON.parse(storedCsvData));

      const storedFitbitConnected = localStorage.getItem(fitbitConnectedKey);
      if (storedFitbitConnected === 'true') {
          setIsFitbitConnected(true);
          setFitbitData(generateMockFitbitData());
      }
      
      const storedMyFitnessPalConnected = localStorage.getItem(myFitnessPalConnectedKey);
      if (storedMyFitnessPalConnected === 'true') {
          setIsMyFitnessPalConnected(true);
          setMyFitnessPalData(generateMockMyFitnessPalData());
      }
    } catch (error) {
      console.error("Failed to load external data from localStorage", error);
    }
  }, [csvStorageKey, fitbitConnectedKey, myFitnessPalConnectedKey]);

  // Save CSV data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(csvStorageKey, JSON.stringify(csvData));
    } catch (error) {
      console.error("Failed to save CSV data to localStorage", error);
    }
  }, [csvData, csvStorageKey]);
  
  // Save Fitbit connection status
  useEffect(() => {
      localStorage.setItem(fitbitConnectedKey, isFitbitConnected.toString());
  }, [isFitbitConnected, fitbitConnectedKey]);

  // Save MyFitnessPal connection status
  useEffect(() => {
    localStorage.setItem(myFitnessPalConnectedKey, isMyFitnessPalConnected.toString());
  }, [isMyFitnessPalConnected, myFitnessPalConnectedKey]);


  const generateMockFitbitData = (): ExternalHealthData[] => {
      const today = new Date();
      const mockData: ExternalHealthData[] = [];
      for(let i=13; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          mockData.push({
              date: dateString,
              metric: 'Pas',
              value: 8000 + Math.floor(Math.random() * 4000) - 2000,
          });
          
          mockData.push({
              date: dateString,
              metric: 'Sommeil',
              value: parseFloat((7 + Math.random() * 2 - 1).toFixed(1)),
          });
      }
      return mockData;
  };

  const generateMockMyFitnessPalData = (): ExternalHealthData[] => {
    const today = new Date();
    const mockData: ExternalHealthData[] = [];
    for(let i=13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        mockData.push({
            date: dateString,
            metric: 'Calories',
            value: 2000 + Math.floor(Math.random() * 500) - 250,
        });
        
        mockData.push({
            date: dateString,
            metric: 'Protéines',
            value: 120 + Math.floor(Math.random() * 40) - 20,
        });
    }
    return mockData;
  };


  const handleFitbitConnect = () => {
      setIsConnectingFitbit(true);
      setTimeout(() => {
          setIsFitbitConnected(true);
          setFitbitData(generateMockFitbitData());
          setIsConnectingFitbit(false);
          alert('Fitbit connecté avec succès ! Les données simulées ont été chargées.');
      }, 2000);
  };

  const handleFitbitDisconnect = () => {
      setIsFitbitConnected(false);
      setFitbitData([]);
      alert('Fitbit a été déconnecté.');
  };

  const handleMyFitnessPalConnect = () => {
    setIsConnectingMyFitnessPal(true);
    setTimeout(() => {
        setIsMyFitnessPalConnected(true);
        setMyFitnessPalData(generateMockMyFitnessPalData());
        setIsConnectingMyFitnessPal(false);
        alert('MyFitnessPal connecté avec succès ! Les données simulées ont été chargées.');
    }, 2000);
  };

  const handleMyFitnessPalDisconnect = () => {
    setIsMyFitnessPalConnected(false);
    setMyFitnessPalData([]);
    alert('MyFitnessPal a été déconnecté.');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        alert("Le fichier est vide.");
        return;
      }

      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) {
        alert("Le fichier CSV est vide ou ne contient pas de lignes de données.");
        return;
      }

      const header = rows[0].split(',').map(h => h.trim().toLowerCase());
      const dateIndex = header.indexOf('date');
      const metricIndex = header.indexOf('metric');
      const valueIndex = header.indexOf('value');

      if (dateIndex === -1 || metricIndex === -1 || valueIndex === -1) {
        alert("L'en-tête du CSV doit contenir les colonnes 'date', 'metric', et 'value'.");
        return;
      }

      const newData: ExternalHealthData[] = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const date = values[dateIndex]?.trim();
        const metric = values[metricIndex]?.trim();
        const value = parseFloat(values[valueIndex]?.trim());

        if (date && metric && !isNaN(value) && new Date(date).toString() !== 'Invalid Date') {
          newData.push({ date, metric, value });
        }
      }

      if (newData.length > 0) {
        setCsvData(prevData => [...prevData, ...newData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        alert(`${newData.length} enregistrements importés avec succès !`);
      } else {
        alert("Aucun enregistrement valide n'a été trouvé dans le fichier.");
      }
    };
    reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const groupedData = useMemo(() => {
    const allData = [...csvData, ...fitbitData, ...myFitnessPalData];
    return allData.reduce((acc, item) => {
        const metric = item.metric.toLowerCase();
        if (!acc[metric]) {
          acc[metric] = [];
        }
        acc[metric].push(item);
        return acc;
    }, {} as Record<string, ExternalHealthData[]>);
  }, [csvData, fitbitData, myFitnessPalData]);

  const chartColors = ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#9013FE', '#4CAF50', '#FB8C00'];

  return (
    <section id="data-sources">
      <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-6">Connectez vos Données de Santé</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {/* Google Fit Card */}
        <div className="relative bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed">
            <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">Bientôt</div>
            <GoogleFitIcon />
            <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Google Fit</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Synchronisation automatique</p>
        </div>

        {/* Apple Health Card */}
        <div className="relative bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed">
            <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">Bientôt</div>
            <AppleHealthIcon />
            <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Apple Santé</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Synchronisation automatique</p>
        </div>
        
        {/* Fitbit Card */}
        {isFitbitConnected ? (
            <div className="bg-teal-50 dark:bg-teal-900/30 p-6 rounded-lg flex flex-col items-center justify-center text-center border-2 border-teal-500">
                <div className="flex items-center text-teal-600 dark:text-teal-300 mb-2">
                    <CheckCircleIcon />
                    <span className="ml-2 font-bold">Connecté</span>
                </div>
                <FitbitIcon />
                <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Fitbit</p>
                <button onClick={handleFitbitDisconnect} className="mt-2 text-xs text-red-500 hover:underline">Déconnecter</button>
            </div>
        ) : (
            <div 
                onClick={handleFitbitConnect}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal-500">
                {isConnectingFitbit ? (
                    <>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Connexion...</p>
                    </>
                ) : (
                    <>
                        <FitbitIcon />
                        <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Connecter Fitbit</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Synchronisation simulée</p>
                    </>
                )}
            </div>
        )}

        {/* MyFitnessPal Card */}
        {isMyFitnessPalConnected ? (
            <div className="bg-sky-50 dark:bg-sky-900/30 p-6 rounded-lg flex flex-col items-center justify-center text-center border-2 border-sky-600">
                <div className="flex items-center text-sky-700 dark:text-sky-300 mb-2">
                    <CheckCircleIcon />
                    <span className="ml-2 font-bold">Connecté</span>
                </div>
                <MyFitnessPalIcon />
                <p className="font-bold mt-2 text-brand-text dark:text-gray-200">MyFitnessPal</p>
                <button onClick={handleMyFitnessPalDisconnect} className="mt-2 text-xs text-red-500 hover:underline">Déconnecter</button>
            </div>
        ) : (
            <div 
                onClick={handleMyFitnessPalConnect}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-sky-600">
                {isConnectingMyFitnessPal ? (
                    <>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600"></div>
                        <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Connexion...</p>
                    </>
                ) : (
                    <>
                        <MyFitnessPalIcon />
                        <p className="font-bold mt-2 text-brand-text dark:text-gray-200">Connecter MyFitnessPal</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Synchronisation simulée</p>
                    </>
                )}
            </div>
        )}


        {/* CSV Upload Card */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-500 dark:border-green-700 p-6 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
             onClick={() => fileInputRef.current?.click()}>
            <CsvIcon />
            <p className="font-bold mt-2 text-green-800 dark:text-green-300">Importer un fichier CSV</p>
            <p className="text-xs text-green-600 dark:text-green-400">Format : date,metric,value</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,text/csv" />
        </div>
      </div>
      
      {Object.keys(groupedData).length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-brand-text dark:text-gray-100 mb-4 border-t border-gray-200 dark:border-gray-700 pt-6">Vos Métriques Externes</h3>
          <div className="space-y-6">
            {Object.entries(groupedData).map(([metric, entries], index) => (
              <div key={metric}>
                <h4 className="text-lg font-semibold text-brand-text dark:text-gray-200 mb-3 capitalize">{metric}</h4>
                <HistoryChart 
                  entries={entries.map((e, idx) => ({ 
                    id: `external-${metric}-${idx}`,
                    date: e.date,
                    rating: e.value,
                    notes: '', 
                  }))}
                  title={`Évolution de : ${metric}`}
                  color={chartColors[index % chartColors.length]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default DataSources;