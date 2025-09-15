import React, { lazy, Suspense, useState } from 'react';
import { Itinerary } from '../types';
// PERF: Removed direct import of pdfExporter to enable dynamic, on-demand loading.
// import { exportItineraryToPDF } from '../utils/pdfExporter';
import { ArrowDownTrayIcon } from './icons/Icons';
import DayCard from './DayCard';
import PackingList from './PackingList';
import TravelCostCard from './TravelCostCard';
import QuoteArtboard from './QuoteArtboard';
import { ItineraryHeaderSkeleton, PackingListSkeleton, DayCardSkeleton, TravelCostCardSkeleton, QuoteArtboardSkeleton } from './Skeletons';


interface ItineraryHeaderProps {
    tripTitle: string;
    destination: string;
    duration: number;
    tripSummary: string;
    isComplete: boolean;
    isDownloading: boolean;
    onDownload: () => void;
    onCreateNewTrip: () => void;
}

const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({ tripTitle, destination, duration, tripSummary, isComplete, isDownloading, onDownload, onCreateNewTrip }) => {
    let downloadButtonText = 'Download as PDF';
    if (isDownloading) {
        downloadButtonText = 'Preparing PDF...';
    } else if (!isComplete) {
        downloadButtonText = 'Generating...';
    }

    return (
        <div className="bg-brand-dark rounded-2xl shadow-xl p-8 sm:p-12 mb-12 animate-fadeIn border border-gray-700">
            <p className="text-sm font-semibold tracking-wide uppercase text-teal-400">Your Personalized Itinerary</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2 mb-3 font-serif">{tripTitle}</h1>
            <p className="text-xl text-gray-300 mb-4">{duration}-day adventure in {destination}</p>
            <p className="text-lg text-gray-400 max-w-3xl">{tripSummary}</p>
            <div className="mt-8 flex flex-wrap justify-start items-center gap-4">
                <button
                    onClick={onDownload}
                    disabled={!isComplete || isDownloading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-brand-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="-ml-1 mr-3 h-5 w-5" />
                    {downloadButtonText}
                </button>
                <button
                    onClick={onCreateNewTrip}
                    className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-full shadow-sm text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors"
                >
                    Plan a New Trip
                </button>
            </div>
        </div>
    );
};


interface ItineraryDisplayProps {
  itinerary: Partial<Itinerary> | null;
  onCreateNewTrip: () => void;
  isShellLoading: boolean;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onCreateNewTrip, isShellLoading }) => {
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    
    const handleDownload = async () => {
        if (itinerary?.isComplete && !isDownloadingPdf) {
            setIsDownloadingPdf(true);
            try {
                // PERF: Dynamically import the PDF exporter only when needed.
                const { exportItineraryToPDF } = await import('../utils/pdfExporter');
                await exportItineraryToPDF(itinerary as Itinerary);
            } catch (error) {
                console.error("Failed to download PDF:", error);
                alert("Sorry, we couldn't create the PDF. Please try again.");
            } finally {
                setIsDownloadingPdf(false);
            }
        }
    };

    if (!itinerary) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><ItineraryHeaderSkeleton /></div>;
    }

    const { tripTitle, destination, duration, tripSummary, isComplete = false, packingList, dailyPlans = [], destinationQuote, travelCost } = itinerary;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {tripTitle && destination && duration && tripSummary ? (
                <ItineraryHeader 
                    tripTitle={tripTitle}
                    destination={destination}
                    duration={duration}
                    tripSummary={tripSummary}
                    isComplete={isComplete}
                    isDownloading={isDownloadingPdf}
                    onDownload={handleDownload}
                    onCreateNewTrip={onCreateNewTrip}
                />
            ) : (
                <ItineraryHeaderSkeleton />
            )}
            
            {/* --- Quote and Cost Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-12 animate-fadeInUp">
                <div className="lg:col-span-2">
                    {destinationQuote ? <QuoteArtboard quote={destinationQuote} /> : isShellLoading ? <QuoteArtboardSkeleton /> : null}
                </div>
                <div className="flex justify-center items-center">
                    {travelCost ? <TravelCostCard travelCost={travelCost} /> : isShellLoading ? <TravelCostCardSkeleton /> : null}
                </div>
            </div>

            {packingList && packingList.length > 0 ? (
                <PackingList packingList={packingList} />
            ) : (
                 !isShellLoading && !isComplete ? <PackingListSkeleton /> : null
            )}

            <div className="space-y-20">
                {dailyPlans.map((dayPlan, index) => (
                    <DayCard 
                        key={dayPlan.day} 
                        dayPlan={dayPlan} 
                        destination={destination!} 
                        style={{ animationDelay: `${index * 100}ms` }}
                    />
                ))}
                {!isComplete && duration && dailyPlans.length < duration && (
                     Array.from({ length: duration - dailyPlans.length }).map((_, index) => (
                        <DayCardSkeleton key={dailyPlans.length + index} style={{ animationDelay: `${(dailyPlans.length + index) * 100}ms` }} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ItineraryDisplay;
