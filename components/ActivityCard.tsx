import React from 'react';
import { Activity } from '../types';
import { ClockIcon, LocationMarkerIcon } from './icons/Icons';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <div className="relative">
      {/* Timeline Dot */}
      <div className="absolute -left-14 top-0 h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white bg-brand-primary" />

      <div className="ml-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-brand-primary flex-shrink-0" />
            <p className="font-semibold text-brand-primary">{activity.time}</p>
          </div>
          {activity.location && (
            <div className="flex items-center space-x-2">
              <LocationMarkerIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{activity.location}</p>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold text-brand-dark">{activity.name}</h3>
        <p className="mt-2 text-gray-600">{activity.description}</p>
      </div>
    </div>
  );
};

export default React.memo(ActivityCard);