import React, { useEffect } from 'react';
import { XIcon, GlobeIcon } from './icons/Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    // --- FIX: Prevent background scroll when modal is open ---
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null; 
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto p-8 sm:p-10 relative animate-fadeInUp max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* FIX: Increased tap target size for better mobile usability */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
          aria-label="Close modal"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center">
            <GlobeIcon className="h-12 w-12 text-brand-primary mb-4" />
            <h2 id="about-modal-title" className="text-3xl font-bold text-brand-dark font-serif mb-2">
                About VoyageAI
            </h2>
            <p className="text-lg text-gray-500 mb-6">Your Smart Itinerary Planner</p>
        </div>

        <div className="text-left space-y-4 text-gray-700">
            <p>
                At VoyageAI, we believe that travel should be an experience of discovery and joy, not a chore of endless planning.
                Our mission is to harness the power of artificial intelligence to craft deeply personalized and unforgettable travel itineraries.
            </p>
            <p>
                Whether you're a history buff, a culinary enthusiast, an adventure seeker, or simply looking to relax, VoyageAI listens to your desires. By simply telling us your destination, interests, and travel style, our sophisticated AI, powered by Google's Gemini models, gets to work. It meticulously designs a day-by-day plan that's not just a schedule, but a story waiting to unfold.
            </p>
             <p className="font-semibold text-brand-dark pt-2">
                We go beyond the beaten path, suggesting hidden gems alongside iconic landmarks to create a truly authentic adventure for you. Welcome to the future of travel planning. Welcome to VoyageAI.
            </p>
        </div>

      </div>
    </div>
  );
};

export default React.memo(AboutModal);