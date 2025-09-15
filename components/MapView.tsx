import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Activity } from '../types';
import { ArrowsPointingOutIcon } from './icons/Icons';

interface MapViewProps {
  activities: Activity[];
  selectedActivity: Activity | null;
  onBoundsReset: () => void;
}

// Fix for default icon issue with bundlers like webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const MapView: React.FC<MapViewProps> = ({ activities, selectedActivity, onBoundsReset }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const fitBounds = () => {
    if (!mapRef.current || markersRef.current.length === 0) return;
    const markerGroup = L.featureGroup(markersRef.current);
    mapRef.current.fitBounds(markerGroup.getBounds(), { padding: [50, 50], maxZoom: 15 });
  };
  
  // Initialize map and create markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView([0, 0], 2);
      
      // Reverted to standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
    
    const map = mapRef.current;

    // Clear previous markers from map and ref
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    const validActivities = activities.filter(a => a.latitude != null && a.longitude != null);
    
    if (validActivities.length > 0) {
      validActivities.forEach((activity, index) => {
        // Reverted to a more standard, less stylized marker
        const customIcon = L.divIcon({
          html: `<div class="bg-brand-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white">${index + 1}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        // Fix: Use a fallback for the optional location property to avoid displaying "undefined".
        const popupContent = `
          <div class="font-sans">
            <div class="font-bold text-base text-brand-dark mb-1">${index + 1}. ${activity.name}</div>
            <p class="text-sm text-gray-600">${activity.location || ''}</p>
          </div>
        `;
        
        // Fix: Added non-null assertions as latitude and longitude are validated in the filter above.
        const marker = L.marker([activity.latitude!, activity.longitude!], { icon: customIcon })
          .bindPopup(popupContent);
        
        marker.addTo(map);
        markersRef.current.push(marker);
      });
      
      fitBounds();
    } else {
        map.setView([0, 0], 2);
    }
    
    // Use a slightly longer timeout to ensure the map container has its final dimensions after animations.
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);

  }, [activities]);

  // Handle flying to selected activity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedActivity) return;
    
    const activityIndex = activities.findIndex(a => a === selectedActivity);
    const marker = markersRef.current[activityIndex];

    if (marker) {
        map.flyTo(marker.getLatLng(), 15, { animate: true, duration: 1 });
        // Use a timeout to ensure popup opens after pan animation
        setTimeout(() => {
            marker.openPopup();
        }, 800);
    }

  }, [selectedActivity, activities]);


  const handleFitBoundsClick = () => {
    fitBounds();
    onBoundsReset();
  };

  return (
    <div className="relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full bg-gray-200" aria-label="Map of daily activities" />
        <button
            onClick={handleFitBoundsClick}
            className="absolute top-3 right-3 z-[401] bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Fit map to all activities"
        >
            <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
        </button>
    </div>
  );
};

export default React.memo(MapView);