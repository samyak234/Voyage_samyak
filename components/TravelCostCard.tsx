import React from 'react';
import { TravelCost } from '../types';
import { PaperAirplaneIcon, TrainIcon } from './icons/Icons';

interface TravelCostCardProps {
    travelCost: TravelCost
}

const TravelCostCard: React.FC<TravelCostCardProps> = ({ travelCost }) => {
  const isOther = travelCost.mode === 'other';

  const Icon = travelCost.mode === 'flight' ? PaperAirplaneIcon : TrainIcon;
  const title = isOther 
    ? 'A Note on Travel' 
    : `Estimated ${travelCost.mode.charAt(0).toUpperCase() + travelCost.mode.slice(1)} Cost`;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center flex flex-col w-full max-w-sm sm:max-w-xs md:max-w-sm">
      <div className="flex justify-center items-center mb-4 h-8">
        {!isOther && <Icon className="h-8 w-8 text-brand-primary" />}
      </div>
      <p className="text-sm font-semibold tracking-wide uppercase text-brand-primary">
        {title}
      </p>
      {!isOther ? (
        <p className="text-4xl sm:text-5xl font-bold text-brand-dark mt-2">
          {travelCost.estimatedCost}
        </p>
      ) : null}
      <p className={`text-sm text-gray-500 mt-4 max-w-md mx-auto ${isOther ? 'text-base' : ''}`}>
        {travelCost.costDisclaimer}
      </p>
    </div>
  );
};

export default React.memo(TravelCostCard);