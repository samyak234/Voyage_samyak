import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { INTEREST_TAGS, BUDGET_OPTIONS } from '../constants';
import { PlusIcon, MinusIcon, PaperAirplaneIcon } from './icons/Icons';

interface PlannerFormProps {
  onPlanTrip: (preferences: UserPreferences) => void;
  error: string | null;
  isLoading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onPlanTrip, error, isLoading }) => {
  const [origin, setOrigin] = useState<string>('New York, USA');
  const [destination, setDestination] = useState<string>('Tokyo, Japan');
  const [duration, setDuration] = useState<number>(5);
  const [interests, setInterests] = useState<string[]>(['Anime', 'History', 'Street Food']);
  const [budget, setBudget] = useState<UserPreferences['budget']>('moderate');

  const handleInterestToggle = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleDuration = (change: number) => {
    setDuration(prev => {
      const newValue = prev + change;
      if (newValue >= 1 && newValue <= 14) {
        return newValue;
      }
      return prev;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!destination || !origin || duration < 1 || interests.length === 0) {
      alert("Please fill in all fields and select at least one interest.");
      return;
    }
    onPlanTrip({ origin, destination, duration, interests, budget });
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12 space-y-12">
        
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 text-center">
             <div>
                <label htmlFor="origin" className="block text-xl font-medium text-gray-500 mb-4">Where are you traveling from?</label>
                <input
                    type="text"
                    id="origin"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-300 focus:border-brand-primary focus:outline-none text-4xl font-bold text-center text-brand-dark font-serif tracking-tight py-3 transition-colors"
                    placeholder="e.g., New York, USA"
                />
             </div>
             <div>
                <label htmlFor="destination" className="block text-xl font-medium text-gray-500 mb-4">And where are you going?</label>
                <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-300 focus:border-brand-primary focus:outline-none text-4xl font-bold text-center text-brand-dark font-serif tracking-tight py-3 transition-colors"
                    placeholder="e.g., Paris, France"
                />
            </div>
          </div>
          
          {/* Duration */}
          <div className="flex flex-col items-center">
              <label className="block text-lg font-medium text-gray-700">And for how long?</label>
               <div className="mt-4 flex items-center justify-center">
                    <button type="button" onClick={() => handleDuration(-1)} className="p-3 rounded-l-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50" disabled={duration <= 1} aria-label="Decrease duration by one day">
                        <MinusIcon className="h-6 w-6" />
                    </button>
                    <div className="text-center w-32 border-y-2 border-gray-200 bg-white py-3">
                        <span className="text-2xl font-semibold text-brand-dark">{duration}</span>
                        <span className="text-base text-gray-500"> {duration === 1 ? ' day' : ' days'}</span>
                    </div>
                    <button type="button" onClick={() => handleDuration(1)} className="p-3 rounded-r-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50" disabled={duration >= 14} aria-label="Increase duration by one day">
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

          {/* Interests */}
          <div>
            <h3 className="text-xl font-medium text-center text-gray-800">What are your interests?</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {INTEREST_TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleInterestToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    interests.includes(tag)
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-xl font-medium text-center text-gray-800">What's your travel style?</h3>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map(option => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setBudget(option.value)}
                  className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                    budget === option.value
                      ? 'border-brand-primary bg-teal-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <option.icon className={`h-6 w-6 mr-3 ${ budget === option.value ? 'text-brand-primary' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-6">
             {error && <p className="text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-brand-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform hover:scale-105 transition-transform disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Planning...' : 'Plan My Trip'}
              {!isLoading && <PaperAirplaneIcon className="h-5 w-5 ml-3" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(PlannerForm);