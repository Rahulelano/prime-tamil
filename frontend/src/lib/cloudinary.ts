import { API_BASE_URL } from '../config';

/**
 * Image utility functions
 * Note: This file was previously named cloudinary.ts but now handles local image paths.
 */

/**
 * Get stored image from localStorage
 * Kept for backward compatibility with development data
 */
export const getStoredImage = (publicId: string): string | null => {
  try {
    const storedImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
    const imageData = storedImages[publicId];
    return imageData ? imageData.base64 : null;
  } catch (error) {
    console.error('Error retrieving stored image:', error);
    return null;
  }
};

/**
 * Get image URL - handles stored images, Cloudinary URLs, and local paths
 */
export const getImageUrl = (url: string | null | undefined): string => {
  // Handle null or undefined URLs
  if (!url) {
    return ''; // Return empty string instead of placeholder
  }

  // If it's a stored image URL pattern, retrieve from localStorage
  if (url.startsWith('/api/images/')) {
    const publicId = url.replace('/api/images/', '');
    const storedImage = getStoredImage(publicId);
    if (storedImage) {
      return storedImage;
    }
    // Fallback to original URL if not found
    return url;
  }

  // If it's a full URL (http/https), return as-is
  if (url.startsWith('http')) {
    return url;
  }

  // If it's a relative path (like /uploads/...), make it absolute by prepending backend URL
  if (url.startsWith('/')) {
    // Remove /api suffix from API_BASE_URL to get the base URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }

  // For any other URLs, return as-is
  return url;
};