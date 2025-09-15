import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-white to-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-brand-dark sm:text-5xl md:text-6xl font-serif">
            <span className="block">Craft Your Perfect Journey</span>
            <span className="block text-brand-primary">with the Power of AI</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tell us your destination, interests, and budget. Our intelligent planner will create a personalized, day-by-day itinerary for your next adventure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Hero);