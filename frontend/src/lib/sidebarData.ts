// Sidebar content management - connected to dataService
import { getActiveAds } from './dataService';

export interface SidebarAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  size: string;
  position: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Functions to get sidebar content from dataService
export const getSidebarAds = (page?: string): SidebarAd[] => {
  const activeAds = getActiveAds();

  // Filter ads by page if provided
  const filteredAds = activeAds.filter(ad => {
    // Only include sidebar ads
    if (!ad.position.startsWith('sidebar')) return false;

    // Check page match
    // If no page provided to function, return all (backward compatibility)
    // If ad is for 'all' pages, include it
    // If ad is for specific page, check match
    return !page || page === 'all' || ad.page === 'all' || ad.page === page;
  });

  return filteredAds.map(ad => ({
    id: ad.id,
    title: ad.title,
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl,
    size: ad.size,
    position: ad.position,
    isActive: ad.isActive,
    impressions: ad.impressions,
    clicks: ad.clicks,
    startDate: ad.startDate,
    endDate: ad.endDate,
    createdAt: ad.createdAt
  }));
};

// Note: Sidebar content is now managed through the admin panel
// Ads are created/edited in AdsManagement component
// and stored via dataService functions