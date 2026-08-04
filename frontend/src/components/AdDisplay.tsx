import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdsByPosition, incrementAdImpressions, incrementAdClicks, type Ad } from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';

interface AdDisplayProps {
  position: string;
  page?: string;
  size?: string;
  className?: string;
}

export default function AdDisplay({ position, page, size, className = '' }: AdDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ads = getAdsByPosition(position, page);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adRef = useRef<HTMLDivElement>(null);

  // Reset index if ads change significantly (e.g. page navigation)
  useEffect(() => {
    setCurrentIndex(0);
  }, [position, page]);

  // Auto-scroll
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [ads.length, isPaused]);

  // Track impressions
  useEffect(() => {
    if (ads.length === 0) return;

    const currentAd = ads[currentIndex];

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            incrementAdImpressions(currentAd.id);
            // Only count once per "view" of this slide
            if (observerRef.current) observerRef.current.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observerRef.current.observe(adRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentIndex, ads]);

  const handleAdClick = (ad: Ad) => {
    if (!ad.linkUrl) return;
    incrementAdClicks(ad.id);
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  };

  const nextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (ads.length === 0) return null;

  const ad = ads[currentIndex];

  return (
    <div
      id={`ad-${position}`}
      ref={adRef}
      className={`bg-gray-100 rounded-lg p-4 text-center relative group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-xs text-gray-500 mb-2">Advertisement</p>

      <div className="relative overflow-hidden rounded">
        <div
          onClick={() => handleAdClick(ad)}
          className={`block transition-opacity duration-300 ${ad.linkUrl ? 'cursor-pointer' : ''}`}
          title={ad.title}
        >
          <img
            src={getImageUrl(ad.imageUrl)}
            alt={ad.title}
            className={`w-full object-cover transition-opacity ${ad.linkUrl ? 'hover:opacity-90' : ''}`}
            style={{
              height: ad.size === '728x90' ? '90px' :
                ad.size === '300x250' ? '250px' :
                  ad.size === '320x50' ? '50px' :
                    ad.size === '300x600' ? '600px' : '250px'
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={prevAd}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous Ad"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextAd}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next Ad"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {ads.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}