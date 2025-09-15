import React, { useState, lazy, Suspense } from 'react';
import { DayPlan, Activity } from '../types';
import ActivityCard from './ActivityCard';
import { fetchCoordinatesForDay } from '../services/geminiService';
import { MapIcon } from './icons/Icons';
import { DayCardSkeleton } from './Skeletons'; // Re-using for map skeleton

const MapView = lazy(() => import('./MapView'));

interface DayCardProps {
  dayPlan: DayPlan;
  destination: string;
  style?: React.CSSProperties;
}

const MapPlaceholder: React.FC<{ onShowMap: () => void, isLoading: boolean }> = ({ onShowMap, isLoading }) => (
    <div className="lg:sticky top-28 h-96 lg:h-[calc(100vh-9rem)] min-h-[400px] rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4">
        <MapIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Ready to explore?</h3>
        <p className="text-gray-500 my-2">Visualize your day's journey on the map.</p>
        <button 
            onClick={onShowMap}
            disabled={isLoading}
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-brand-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Loading Map...' : 'View on Map'}
        </button>
    </div>
);

const DayCard: React.FC<DayCardProps> = ({ dayPlan, destination, style }) => {
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [activitiesWithCoords, setActivitiesWithCoords] = useState<Activity[] | null>(null);

    const handleViewMap = async () => {
        if (isMapVisible) return;
        setIsMapLoading(true);
        try {
            const coords = await fetchCoordinatesForDay(dayPlan.activities, destination);
            setActivitiesWithCoords(coords);
            setIsMapVisible(true);
        } catch (error) {
            console.error("Failed to fetch coordinates for map:", error);
            alert("Sorry, we couldn't load the map data for this day. Please try again later.");
        } finally {
            setIsMapLoading(false);
        }
    };
    
    return (
        <section className="animate-fadeInUp" style={style} aria-labelledby={`day-${dayPlan.day}-heading`}>
            <div className="mb-8">
                <div className="flex items-baseline space-x-4">
                    <span className="font-serif text-5xl font-bold text-brand-primary">Day {dayPlan.day}</span>
                    <h2 id={`day-${dayPlan.day}-heading`} className="text-3xl font-bold text-brand-dark font-serif">{dayPlan.title}</h2>
                </div>
                {dayPlan.summary && <p className="text-gray-600 mt-4 max-w-3xl">{dayPlan.summary}</p>}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
                {/* --- Activities Timeline --- */}
                <div className="relative border-l-4 border-teal-100 pl-8 space-y-10">
                    {dayPlan.activities.map((activity, index) => (
                        <ActivityCard 
                            key={index} 
                            activity={activity} 
                        />
                    ))}
                </div>

                {/* --- On-Demand Map --- */}
                <div className="mt-8 lg:mt-0">
                    {!isMapVisible ? (
                        <MapPlaceholder onShowMap={handleViewMap} isLoading={isMapLoading} />
                    ) : (
                        <div className="lg:sticky top-28 h-96 lg:h-[calc(100vh-9rem)] min-h-[400px] rounded-2xl shadow-lg overflow-hidden">
                            <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse" />}>
                                <MapView 
                                    activities={activitiesWithCoords || []} 
                                    selectedActivity={null}
                                    onBoundsReset={() => {}}
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default React.memo(DayCard);