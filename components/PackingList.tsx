import React from 'react';
import { BriefcaseIcon, CheckCircleIcon } from './icons/Icons';
import { PackingListItem } from '../types';

interface PackingListProps {
  packingList: PackingListItem[];
}

const PackingList: React.FC<PackingListProps> = ({ packingList }) => {
  if (!packingList || packingList.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-100 animate-fadeInUp">
      <div className="flex items-center mb-6">
        <BriefcaseIcon className="h-8 w-8 text-brand-primary" />
        <h2 className="ml-4 text-2xl font-bold text-brand-dark font-serif">What to Pack</h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
        {packingList.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-1" />
            <p className="text-gray-700">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(PackingList);