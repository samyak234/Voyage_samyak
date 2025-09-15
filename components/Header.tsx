
import React, { useState, lazy, Suspense } from 'react';
import { GlobeIcon } from './icons/Icons';
import { Localization } from '../types';

const AboutModal = lazy(() => import('./AboutModal'));

interface HeaderProps {
  onGoHome: () => void;
  localization: Localization | null;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, localization }) => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const aboutUsText = localization?.translatedStrings?.aboutUs || 'About Us';

  return (
    <>
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={onGoHome}>
              <GlobeIcon className="h-9 w-9 text-brand-primary" />
              <span className="ml-3 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-teal-600">
                VoyageAI
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="text-gray-600 hover:text-brand-primary transition-colors duration-200 text-lg font-medium"
                aria-label="Open About Us modal"
              >
                {aboutUsText}
              </button>
            </nav>
          </div>
        </div>
      </header>
      {isAboutModalOpen && (
        <Suspense fallback={null}>
          <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default React.memo(Header);
