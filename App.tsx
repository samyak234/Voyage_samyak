import React, { useState, useCallback } from 'react';
import { UserPreferences, Itinerary } from './types';
import { generateTripHeader, generateShellSecondaryData, generateDailyPlans, generatePackingListStream } from './services/geminiService';

import Header from './components/Header';
import Hero from './components/Hero';
import PlannerForm from './components/PlannerForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import Footer from './components/Footer';

type AppView = 'form' | 'itinerary';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<Partial<Itinerary> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('form');

  const handlePlanTrip = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setView('itinerary');
    window.scrollTo(0, 0);

    setItinerary({ destination: preferences.destination, duration: preferences.duration });

    try {
      // --- STAGE 1: The Sub-Second "Cognitive Acknowledgment" ---
      const tripHeader = await generateTripHeader(preferences);
      setItinerary(prev => ({ ...prev, ...tripHeader }));
      setIsLoading(false); // Shell has loaded, subsequent loading is progressive.

      // --- STAGE 2: The "Digital Assembly Line" ---
      const streamPackingList = async () => {
        try {
          for await (const item of generatePackingListStream(preferences)) {
            setItinerary(prev => ({
              ...prev,
              packingList: [...(prev?.packingList || []), item]
            }));
          }
        } catch (e) { console.error("Packing list stream failed:", e); }
      };

      const loadDailyPlans = async () => {
        await generateDailyPlans(preferences, (newDayPlan) => {
          setItinerary(prev => ({
            ...prev,
            dailyPlans: [...(prev?.dailyPlans || []), newDayPlan].sort((a, b) => a.day - b.day)
          }));
        });
      };

      const loadSecondaryData = async () => {
        const secondaryData = await generateShellSecondaryData(preferences);
        setItinerary(prev => ({ ...prev, ...secondaryData }));
      };
      
      // Run all secondary processes concurrently
      await Promise.all([streamPackingList(), loadDailyPlans(), loadSecondaryData()]);

      // --- STAGE 3: Finalize ---
      setItinerary(prev => {
        const completeItinerary = { ...prev, isComplete: true } as Itinerary;
        return completeItinerary;
      });

    } catch (err: any) {
      console.error("Itinerary generation failed:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setView('form');
      setItinerary(null);
      setIsLoading(false);
    }
  }, []);

  const handleCreateNewTrip = useCallback(() => {
    setView('form');
    setItinerary(null);
    setError(null);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header onGoHome={handleCreateNewTrip} localization={itinerary?.localization || null} />
      
      <main className="flex-grow">
        {view === 'form' && (
          <>
            <Hero />
            <PlannerForm onPlanTrip={handlePlanTrip} error={error} isLoading={isLoading} />
          </>
        )}

        {view === 'itinerary' && (
          <ItineraryDisplay 
            itinerary={itinerary} 
            onCreateNewTrip={handleCreateNewTrip}
            isShellLoading={isLoading}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;