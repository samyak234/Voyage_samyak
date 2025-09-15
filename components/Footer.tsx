import React from 'react';
import { GlobeIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from './icons/Icons';

const WaveSeparator = () => (
  <div className="w-full h-20 sm:h-24 md:h-28">
    <svg
      className="block w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
    >
      {/* Layer 1: Darkest teal, in the back */}
      <path
        fill="rgba(17, 94, 89, 0.5)" // A darker, semi-transparent teal
        d="M0,80 C240,40 480,120 720,80 C960,40 1200,120 1440,80 V120 H0 Z"
      />
      {/* Layer 2: Brand primary teal, in the middle */}
      <path
        fill="rgba(13, 148, 136, 0.6)" // brand-primary with some transparency
        d="M0,90 C240,60 480,120 720,90 C960,60 1200,120 1440,90 V120 H0 Z"
      />
      {/* Layer 3: Lighter teal, in the front */}
      <path
        fill="rgb(20, 184, 166)" // A solid, lighter teal
        d="M0,100 C240,80 480,120 720,100 C960,80 1200,120 1440,100 V120 H0 Z"
      />
    </svg>
  </div>
);


const Footer: React.FC = () => {
  const preventDefault = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="mt-16">
      <WaveSeparator />
      <footer className="bg-gray-100 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
            {/* Column 1: Brand */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <GlobeIcon className="h-9 w-9 text-brand-primary" />
                <span className="ml-3 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-teal-600">
                  VoyageAI
                </span>
              </div>
              <p className="mt-4 text-gray-500 max-w-xs">
                Crafting unforgettable journeys with the power of artificial intelligence.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" onClick={preventDefault} className="text-base text-gray-500 hover:text-brand-primary transition-colors">Home</a></li>
                <li><a href="#" onClick={preventDefault} className="text-base text-gray-500 hover:text-brand-primary transition-colors">About Us</a></li>
                <li><a href="#" onClick={preventDefault} className="text-base text-gray-500 hover:text-brand-primary transition-colors">Features</a></li>
              </ul>
            </div>

            {/* Column 3: Technology */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Technology</h3>
              <ul className="mt-4 space-y-4">
                 <li>
                  <span className="text-base text-gray-500">Maps by</span><br/>
                  <span className="font-semibold text-brand-dark">Leaflet</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
              <div className="mt-4 flex justify-center md:justify-start space-x-6">
                <a href="#" onClick={preventDefault} className="text-gray-400 hover:text-brand-primary transition-colors">
                  <span className="sr-only">Twitter</span>
                  <TwitterIcon className="h-6 w-6" />
                </a>
                <a href="#" onClick={preventDefault} className="text-gray-400 hover:text-brand-primary transition-colors">
                  <span className="sr-only">Instagram</span>
                  <InstagramIcon className="h-6 w-6" />
                </a>
                <a href="#" onClick={preventDefault} className="text-gray-400 hover:text-brand-primary transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <LinkedInIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} VoyageAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Footer);