// Shared data service for frontend persistence
// This simulates backend API calls with localStorage persistence

import { API_BASE_URL } from '../config';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Safely fetch a URL with a timeout (default 1200ms).
 * Returns Response object or null if timed out or failed to fetch.
 */
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 1200): Promise<Response | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    return null;
  }
};

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetchWithTimeout(url, config, 1500);

  if (!response || !response.ok) {
    const errorData = response ? await response.json().catch(() => ({ message: 'Network error' })) : { message: 'Backend unavailable' };
    throw new Error(errorData.message || errorData.error || `HTTP ${response?.status || 503}`);
  }

  return response.json();
};


export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  category_id: string;
  author_id: string;
  images: string[];
  views: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  tags: string[];
  is_featured: boolean;
  is_breaking: boolean;
  // Populated relations when fetched from backend API
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
  };
  author_name?: string;
  author_logo?: string;
  created_by_user_id?: string;
  created_by_special_name?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  articleCount?: number;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
}

export interface EpaperIssue {
  id: string;
  issueDate: string;
  pdfUrl: string;
  coverImage?: string;
  pageCount: number;
  title?: string;
  description?: string;
  status: string;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  tags: string[];
  isActive: boolean;
  views: number;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: string; // Specific ad position identifier
  page: string; // Page where ad should appear (e.g., 'home', 'article', 'category')
  size: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  ARTICLES: 'cbe_articles',
  CATEGORIES: 'cbe_categories',
  AUTHORS: 'cbe_authors',
  EPAPER_ISSUES: 'cbe_epaper_issues',
  VIDEOS: 'cbe_videos',
  ADS: 'cbe_ads'
};

// Initialize with seed data if not exists - Commented out to start fresh with admin-created content
/*
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    const seedArticles: Article[] = [
      {
        id: '1',
        title: 'Coimbatore Vizha to be held from November 14 to 24',
        slug: 'coimbatore-vizha-november-14-24',
        excerpt: 'The 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter.',
        content: 'The 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter. The festival will be officially launched on the evening of October 31 at Brookefields Mall.\n\nOver 100 events are planned across 11 days, featuring the marquee Sky Dance projection mapping experience held each evening at CODISSIA Trade Fair Complex. This years Vizha emphasizes inclusivity, with business pitches by transgender entrepreneurs and para sports events for children with autism.\n\nEvents are spread across multiple neighborhoods to engage residents directly. Highlights include the Isai Mazhai music program at six venues, clean-up drives at five locations, cultural showcases at 11 sites, and the Art Street festival on Scheme Road on November 22 and 23, along with musical performances on East TV Swamy Road.\n\nThe festival aims to celebrate the spirit and diversity of Coimbatore through culture, community, and creativity.',
        status: 'published',
        category_id: '7',
        author_id: '1',
        featured_image: '/news (2).jpeg',
        views: 2100,
        published_at: '2025-11-07T09:00:00Z',
        created_at: '2025-11-06T10:00:00Z',
        updated_at: '2025-11-07T09:00:00Z',
        tags: ['festival', 'coimbatore', 'culture'],
        is_featured: true,
        is_breaking: false,
        seo_title: 'Coimbatore Vizha 2025 - Complete Schedule and Events',
        seo_description: 'Join us for Coimbatore Vizha 2025 from November 14-24. Over 100 events celebrating the spirit and diversity of Coimbatore.'
      },
      {
        id: '2',
        title: 'New Traffic System Implementation in Coimbatore',
        slug: 'new-traffic-system-implementation-coimbatore',
        excerpt: 'Coimbatore Traffic Police announces the implementation of an advanced traffic management system across the city.',
        content: 'The Coimbatore Traffic Police announced the implementation of an advanced traffic management system across the city to tackle increasing traffic congestion. The new system includes smart signals, automatic number plate recognition cameras, and real-time traffic monitoring.\n\nThe initiative, part of the Smart City Mission, will cover 150 major intersections in the city. The smart traffic signals will automatically adjust timing based on real-time traffic conditions, reducing wait times by up to 40%.\n\nAdditionally, the system will feature emergency vehicle prioritization, which will allow ambulances and fire services to pass through intersections with minimal delays. The automatic number plate recognition cameras will help in tracking violations and stolen vehicles.\n\nTraffic Police Commissioner A. Saravana Sundar stated that the system will be implemented in phases, with the first phase covering the city center and major arterial roads. The second phase will extend to suburban areas.\n\nCitizens can also access real-time traffic information through a mobile application that will be launched alongside the new system. The app will provide alternative routes, real-time congestion updates, and parking availability information.',
        status: 'review',
        category_id: '8',
        author_id: '1',
        featured_image: '/news (17).jpeg',
        views: 1850,
        published_at: '',
        created_at: '2025-11-07T01:30:00Z',
        updated_at: '2025-11-07T02:00:00Z',
        tags: ['traffic', 'smart city', 'infrastructure'],
        is_featured: false,
        is_breaking: false,
        seo_title: 'Smart Traffic Management System in Coimbatore',
        seo_description: 'Advanced traffic management system with smart signals and ANPR cameras being implemented in Coimbatore.'
      },
      {
        id: '3',
        title: 'Local Youth Wins Gold in National Swimming Championship',
        slug: 'local-youth-wins-gold-national-swimming',
        excerpt: '19-year-old Arjun Krishnan from Coimbatore won gold in the 200m freestyle event at the National Swimming Championship.',
        content: '19-year-old Arjun Krishnan from Coimbatore made the city proud by winning gold in the 200m freestyle event at the National Swimming Championship held in Bengaluru. Arjun completed the race in 1:48.32 seconds, setting a new national record for his age group.\n\nThis is not the first time Arjun has brought laurels to Coimbatore. He has previously won multiple state-level championships and has been training under renowned coach Rajesh Kumar for the past five years.\n\nHis coach praised Arjun\'s dedication and hard work, mentioning that he trains for six hours daily despite his college studies. The young swimmer aims to represent India in international competitions and hopes to qualify for the upcoming Asian Games.\n\nThe Coimbatore District Sports Development Authority has announced that they will provide Arjun with enhanced training facilities and support for his international aspirations. The state government has also announced a cash prize of ₹2 lakhs for his achievement.\n\nArjun\'s success has inspired many young swimmers in the city, and swimming academies in Coimbatore have reported a 30% increase in enrollments following his victory.',
        status: 'draft',
        category_id: '4',
        author_id: '2',
        featured_image: '/news (18).jpeg',
        views: 0,
        published_at: '',
        created_at: '2025-11-07T01:00:00Z',
        updated_at: '2025-11-07T01:15:00Z',
        tags: ['sports', 'swimming', 'championship'],
        is_featured: false,
        is_breaking: false
      },
      {
        id: '4',
        title: 'PM Modi to Launch Ernakulam–Coimbatore Bharat Rail Tomorrow',
        slug: 'pm-modi-ernakulam-coimbatore-bharat-rail',
        excerpt: 'Prime Minister Narendra Modi will flag off a special Bharat Rail service from Ernakulam in Kerala to Coimbatore tomorrow.',
        content: 'Prime Minister Narendra Modi will flag off a special Bharat Rail service from Ernakulam in Kerala to Coimbatore tomorrow for the convenience of passengers traveling between the two regions.\n\nThe Southern Railway announced that the service will operate between Ernakulam and Coimbatore to ease heavy passenger traffic on this route. As per the schedule, the special train will depart from Ernakulam Junction at 1:50 p.m. and reach Coimbatore at 5:10 p.m. The return journey from Coimbatore to Ernakulam will commence at 11 p.m. (Train No. 26652) and arrive at Ernakulam Junction by 2:20 a.m.\n\nPrime Minister Modi will formally inaugurate this new rail service tomorrow morning at 8 a.m. via video conference from Konnoli, marking another milestone in the region\'s enhanced rail connectivity.',
        status: 'published',
        category_id: '8',
        author_id: '1',
        featured_image: '/news (15).jpeg',
        views: 4100,
        published_at: '2025-11-07T02:30:00Z',
        created_at: '2025-11-06T15:00:00Z',
        updated_at: '2025-11-07T02:30:00Z',
        tags: ['railway', 'bharat rail', 'modi', 'transport'],
        is_featured: false,
        is_breaking: true,
        seo_title: 'PM Modi Launches Ernakulam-Coimbatore Bharat Rail Service',
        seo_description: 'Special Bharat Rail service connecting Ernakulam and Coimbatore flagged off by PM Modi tomorrow.'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(seedArticles));
  }
 
  // Check if categories need update (version check)
  const currentCategories = getStoredData<Category>(STORAGE_KEYS.CATEGORIES);
  const expectedCategories = [
    { id: '1', name: 'Local', slug: 'local', description: 'Local news from Coimbatore' },
    { id: '2', name: 'Education', slug: 'education', description: 'Education and school news' },
    { id: '3', name: 'Business', slug: 'business', description: 'Business and economic news' },
    { id: '4', name: 'Sports', slug: 'sports', description: 'Sports and athletic events' },
    { id: '5', name: 'Real Estate', slug: 'real-estate', description: 'Real estate and property news' },
    { id: '6', name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and entertainment news' },
    { id: '7', name: 'Events', slug: 'events', description: 'Community events and celebrations' },
    { id: '8', name: 'Political', slug: 'political', description: 'Political news and developments' },
    { id: '9', name: 'Devotional', slug: 'devotional', description: 'Religious and spiritual news' }
  ];
 
  // Update if categories don't match expected
  const categoriesMatch = currentCategories.length === expectedCategories.length &&
    currentCategories.every(cat => expectedCategories.some(exp => exp.id === cat.id && exp.name === cat.name));
 
  if (!categoriesMatch) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(expectedCategories));
  }
 
  if (!localStorage.getItem(STORAGE_KEYS.AUTHORS)) {
    const seedAuthors: Author[] = [
      { id: '1', name: 'Coimbatore Express Staff', bio: 'Our dedicated team of local journalists', avatar_url: '', email: 'news@coimbatoreexpress.com' },
      { id: '2', name: 'Sports Correspondent', bio: 'Covering local sports and athletic events', avatar_url: '', email: 'sports@coimbatoreexpress.com' },
      { id: '3', name: 'Business Reporter', bio: 'Reporting on local business and economic developments', avatar_url: '', email: 'business@coimbatoreexpress.com' }
    ];
    localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(seedAuthors));
  }
};
*/

const initializeData = () => {
  // Ensure STORAGE_KEYS.ARTICLES key exists without injecting mock data by default
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify([]));
  }

  const storedCategoriesStr = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  let storedCategories: any[] = [];
  try {
    storedCategories = storedCategoriesStr ? JSON.parse(storedCategoriesStr) : [];
  } catch {
    storedCategories = [];
  }

  if (storedCategories.length === 0) {
    // Set up basic categories
    const categories = [
      { id: '1', name: 'Local', slug: 'local', description: 'Local news from Coimbatore' },
      { id: '2', name: 'Education', slug: 'education', description: 'Education and school news' },
      { id: '3', name: 'Business', slug: 'business', description: 'Business and economic news' },
      { id: '4', name: 'Sports', slug: 'sports', description: 'Sports and athletic events' },
      { id: '5', name: 'Real Estate', slug: 'real-estate', description: 'Real estate and property news' },
      { id: '6', name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and entertainment news' },
      { id: '7', name: 'Events', slug: 'events', description: 'Community events and celebrations' },
      { id: '8', name: 'Political', slug: 'political', description: 'Political news and developments' },
      { id: '9', name: 'Devotional', slug: 'devotional', description: 'Religious and spiritual news' }
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUTHORS)) {
    // Set up basic authors
    const authors = [
      { id: '1', name: 'Coimbatore Express Staff', bio: 'Our dedicated team of local journalists', avatar_url: '', email: 'news@coimbatoreexpress.com' },
      { id: '2', name: 'Sports Correspondent', bio: 'Covering local sports and athletic events', avatar_url: '', email: 'sports@coimbatoreexpress.com' },
      { id: '3', name: 'Business Reporter', bio: 'Reporting on local business and economic developments', avatar_url: '', email: 'business@coimbatoreexpress.com' }
    ];
    localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
  }
};

// Utility functions
const getStoredData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const setStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// Article functions
export const getArticles = (): Article[] => {
  initializeData();
  return getStoredData<Article>(STORAGE_KEYS.ARTICLES);
};

export const getPublishedArticles = (): Article[] => {
  return getArticles().filter(article => article.status === 'published');
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return getArticles().find(article => article.slug === slug);
};

export const getArticlesByCategory = (categoryId: string): Article[] => {
  return getPublishedArticles().filter(article => article.category_id === categoryId);
};

export const getTotalArticlesByCategory = (categorySlug: string): number => {
  const category = getCategories().find(cat => cat.slug === categorySlug);
  if (!category) return 0;
  return getArticlesByCategory(category.name).length;
};

export const getFeaturedArticles = (): Article[] => {
  return getPublishedArticles().filter(article => article.is_featured);
};

export const getBreakingNews = (): Article[] => {
  return getPublishedArticles().filter(article => article.is_breaking);
};

export const getTrendingArticles = (): Article[] => {
  return getPublishedArticles()
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
};

export const getMostReadArticles = (): Article[] => {
  return getPublishedArticles()
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 5);
};

export const searchArticles = (searchTerm: string): Article[] => {
  const term = searchTerm.toLowerCase();
  return getPublishedArticles()
    .filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term)
    )
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
};

export const addArticle = (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>): Article => {
  const articles = getArticles();
  const newArticle: Article = {
    ...articleData,
    id: Date.now().toString(),
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  articles.unshift(newArticle); // Add to beginning
  setStoredData(STORAGE_KEYS.ARTICLES, articles);
  return newArticle;
};

export const updateArticle = (id: string, updates: Partial<Article>): Article | null => {
  const articles = getArticles();
  const index = articles.findIndex(article => article.id === id);
  if (index !== -1) {
    articles[index] = { ...articles[index], ...updates, updated_at: new Date().toISOString() };
    setStoredData(STORAGE_KEYS.ARTICLES, articles);
    return articles[index];
  }
  return null;
};

export const deleteArticle = (id: string): boolean => {
  const articles = getArticles();
  const filteredArticles = articles.filter(article => article.id !== id);
  if (filteredArticles.length !== articles.length) {
    setStoredData(STORAGE_KEYS.ARTICLES, filteredArticles);
    return true;
  }
  return false;
};

export const updateArticleStatus = (id: string, status: Article['status']): boolean => {
  const articles = getArticles();
  const article = articles.find(a => a.id === id);
  if (article) {
    const updates: Partial<Article> = { status };
    if (status === 'published' && !article.published_at) {
      updates.published_at = new Date().toISOString();
    }
    return updateArticle(id, updates) !== null;
  }
  return false;
};

// Category functions
export const getCategories = (): Category[] => {
  initializeData();
  return getStoredData<Category>(STORAGE_KEYS.CATEGORIES);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return getCategories().find(category => category.slug === slug);
};

export const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
  const categories = getCategories();
  const newCategory: Category = {
    ...categoryData,
    id: Date.now().toString()
  };
  categories.push(newCategory);
  setStoredData(STORAGE_KEYS.CATEGORIES, categories);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const categories = getCategories();
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    setStoredData(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }
  return null;
};

export const deleteCategory = (id: string): boolean => {
  const categories = getCategories();
  const filteredCategories = categories.filter(category => category.id !== id);
  if (filteredCategories.length !== categories.length) {
    setStoredData(STORAGE_KEYS.CATEGORIES, filteredCategories);
    return true;
  }
  return false;
};

// Author functions
export const getAuthors = (): Author[] => {
  initializeData();
  return getStoredData<Author>(STORAGE_KEYS.AUTHORS);
};

export const addAuthor = (authorData: Omit<Author, 'id'>): Author => {
  const authors = getAuthors();
  const newAuthor: Author = {
    ...authorData,
    id: Date.now().toString()
  };
  authors.push(newAuthor);
  setStoredData(STORAGE_KEYS.AUTHORS, authors);
  return newAuthor;
};

// E-paper functions
export const getEpaperIssues = (): EpaperIssue[] => {
  initializeData();
  return getStoredData<EpaperIssue>(STORAGE_KEYS.EPAPER_ISSUES);
};

export const getEpaperIssuesByDateRange = (startDate?: Date, endDate?: Date): EpaperIssue[] => {
  let filtered = getEpaperIssues();

  if (startDate) {
    filtered = filtered.filter(issue => new Date(issue.issueDate) >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter(issue => new Date(issue.issueDate) <= endDate);
  }

  return filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

export const addEpaperIssue = (issueData: Omit<EpaperIssue, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'viewCount'>): EpaperIssue => {
  const issues = getEpaperIssues();
  const newIssue: EpaperIssue = {
    ...issueData,
    id: Date.now().toString(),
    downloadCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  issues.unshift(newIssue); // Add to beginning
  setStoredData(STORAGE_KEYS.EPAPER_ISSUES, issues);
  return newIssue;
};

export const updateEpaperIssue = (id: string, updates: Partial<EpaperIssue>): EpaperIssue | null => {
  const issues = getEpaperIssues();
  const index = issues.findIndex(issue => issue.id === id);
  if (index !== -1) {
    issues[index] = { ...issues[index], ...updates };
    setStoredData(STORAGE_KEYS.EPAPER_ISSUES, issues);
    return issues[index];
  }
  return null;
};

export const deleteEpaperIssue = (id: string): boolean => {
  const issues = getEpaperIssues();
  const filteredIssues = issues.filter(issue => issue.id !== id);
  if (filteredIssues.length !== issues.length) {
    setStoredData(STORAGE_KEYS.EPAPER_ISSUES, filteredIssues);
    return true;
  }
  return false;
};

// API-based E-paper functions
export const getEpaperIssuesAPI = async (): Promise<EpaperIssue[]> => {
  try {
    const response = await apiRequest('/epaper');
    return response.data.issues || [];
  } catch (error) {
    console.error('Error fetching e-paper issues:', error);
    // Fallback to localStorage
    return getEpaperIssues();
  }
};

export const addEpaperIssueAPI = async (formData: FormData): Promise<EpaperIssue> => {
  try {
    const response = await fetch(`${API_BASE_URL}/epaper`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data.issue;
  } catch (error) {
    console.error('Error creating e-paper issue:', error);
    throw error;
  }
};

export const updateEpaperIssueAPI = async (id: string, updates: Partial<EpaperIssue>): Promise<EpaperIssue | null> => {
  try {
    const response = await apiRequest(`/epaper/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data.issue;
  } catch (error) {
    console.error('Error updating e-paper issue:', error);
    return null;
  }
};

export const deleteEpaperIssueAPI = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/epaper/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting e-paper issue:', error);
    return false;
  }
};

export const downloadEpaperAPI = (id: string): string => {
  return `${API_BASE_URL}/epaper/${id}/download`;
};

// Video functions
export const getVideos = (): Video[] => {
  initializeData();
  return getStoredData<Video>(STORAGE_KEYS.VIDEOS);
};

export const getActiveVideos = (): Video[] => {
  return getVideos().filter(video => video.isActive);
};

export const addVideo = (videoData: Omit<Video, 'id' | 'createdAt' | 'views'>): Video => {
  const videos = getVideos();
  const newVideo: Video = {
    ...videoData,
    id: Date.now().toString(),
    views: 0,
    createdAt: new Date().toISOString()
  };
  videos.unshift(newVideo); // Add to beginning
  setStoredData(STORAGE_KEYS.VIDEOS, videos);
  return newVideo;
};

export const updateVideo = (id: string, updates: Partial<Video>): Video | null => {
  const videos = getVideos();
  const index = videos.findIndex(video => video.id === id);
  if (index !== -1) {
    videos[index] = { ...videos[index], ...updates };
    setStoredData(STORAGE_KEYS.VIDEOS, videos);
    return videos[index];
  }
  return null;
};

export const deleteVideo = (id: string): boolean => {
  const videos = getVideos();
  const filteredVideos = videos.filter(video => video.id !== id);
  if (filteredVideos.length !== videos.length) {
    setStoredData(STORAGE_KEYS.VIDEOS, filteredVideos);
    return true;
  }
  return false;
};

export const toggleVideoActive = (id: string): boolean => {
  const videos = getVideos();
  const video = videos.find(v => v.id === id);
  if (video) {
    return updateVideo(id, { isActive: !video.isActive }) !== null;
  }
  return false;
};

// Ad functions
export const getAds = (): Ad[] => {
  initializeData();
  const ads = getStoredData<Ad>(STORAGE_KEYS.ADS);

  // Migration: Add default 'page' field to existing ads
  const migratedAds = ads.map(ad => ({
    ...ad,
    page: ad.page || 'all' // Default to 'all' for existing ads
  }));

  // Save migrated data back to localStorage if migration was needed
  if (migratedAds.some((ad, index) => ad.page !== ads[index]?.page)) {
    setStoredData(STORAGE_KEYS.ADS, migratedAds);
  }

  return migratedAds;
};

export const getActiveAds = (): Ad[] => {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return getAds().filter(ad =>
    ad.isActive &&
    ad.startDate <= now &&
    ad.endDate >= now
  );
};

export const getAdsByPosition = (position: string, page?: string): Ad[] => {
  return getActiveAds().filter(ad => {
    const positionMatch = ad.position === position;
    const pageMatch = !page || page === 'all' || ad.page === 'all' || ad.page === page;
    return positionMatch && pageMatch;
  });
};

export const addAd = (adData: Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks'>): Ad => {
  const ads = getAds();
  const newAd: Ad = {
    ...adData,
    id: Date.now().toString(),
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString()
  };
  ads.unshift(newAd); // Add to beginning
  setStoredData(STORAGE_KEYS.ADS, ads);
  return newAd;
};

export const updateAd = (id: string, updates: Partial<Ad>): Ad | null => {
  const ads = getAds();
  const index = ads.findIndex(ad => ad.id === id);
  if (index !== -1) {
    ads[index] = { ...ads[index], ...updates };
    setStoredData(STORAGE_KEYS.ADS, ads);
    return ads[index];
  }
  return null;
};

export const deleteAd = (id: string): boolean => {
  const ads = getAds();
  const filteredAds = ads.filter(ad => ad.id !== id);
  if (filteredAds.length !== ads.length) {
    setStoredData(STORAGE_KEYS.ADS, filteredAds);
    return true;
  }
  return false;
};

export const toggleAdActive = (id: string): boolean => {
  const ads = getAds();
  const ad = ads.find(a => a.id === id);
  if (ad) {
    return updateAd(id, { isActive: !ad.isActive }) !== null;
  }
  return false;
};

export const incrementAdImpressions = (id: string): boolean => {
  const ads = getAds();
  const ad = ads.find(a => a.id === id);
  if (ad) {
    return updateAd(id, { impressions: ad.impressions + 1 }) !== null;
  }
  return false;
};

export const incrementAdClicks = (id: string): boolean => {
  const ads = getAds();
  const ad = ads.find(a => a.id === id);
  if (ad) {
    return updateAd(id, { clicks: ad.clicks + 1 }) !== null;
  }
  return false;
};

// Related articles function
export const getRelatedArticles = (articleId: string, categoryId: string, limit: number = 3): Article[] => {
  return getPublishedArticles()
    .filter(article => article.id !== articleId && article.category_id === categoryId)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Adapter functions to convert between interfaces
export const convertToNewsDataArticle = (article: Article): import('./newsData').Article => ({
  id: article.id,
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  content: article.content,
  featured_image_url: article.images.length > 0 ? article.images[0] : '',
  category_id: article.category_id,
  author_id: article.author_id,
  is_featured: article.is_featured,
  is_breaking: article.is_breaking,
  views: article.views,
  published_at: article.published_at,
  categories: getCategories().find(cat => cat.id === article.category_id),
  authors: getAuthors().find(auth => auth.id === article.author_id)
});

// Convert backend article to frontend Article interface
export const convertBackendArticleToFrontend = (backendArticle: any): import('./newsData').Article => ({
  id: backendArticle.id,
  title: backendArticle.title,
  slug: backendArticle.slug,
  excerpt: backendArticle.excerpt,
  content: backendArticle.content,
  featured_image_url: backendArticle.images && backendArticle.images.length > 0 ? backendArticle.images[0] : '',
  category_id: backendArticle.categoryId,
  author_id: backendArticle.authorId,
  is_featured: backendArticle.isFeatured,
  is_breaking: backendArticle.isBreaking,
  views: backendArticle.views,
  published_at: backendArticle.publishedAt,
  categories: backendArticle.category ? {
    id: backendArticle.category.id,
    name: backendArticle.category.name,
    slug: backendArticle.category.slug,
    description: backendArticle.category.description || ''
  } : undefined,
  authors: backendArticle.author ? {
    id: backendArticle.author.id,
    name: backendArticle.author.name,
    bio: backendArticle.author.bio,
    avatar_url: backendArticle.author.avatar,
    email: backendArticle.author.email || ''
  } : undefined,
  author_name: backendArticle.authorName,
  author_logo: backendArticle.authorLogo
});

// Convert backend article to dataService Article interface
export const convertBackendArticleToDataService = (backendArticle: any): Article => ({
  id: backendArticle.id,
  title: backendArticle.title,
  slug: backendArticle.slug,
  excerpt: backendArticle.excerpt,
  content: backendArticle.content,
  images: backendArticle.images || [],
  category_id: backendArticle.categoryId,
  author_id: backendArticle.authorId,
  status: backendArticle.status?.toLowerCase() || 'draft',
  is_featured: backendArticle.isFeatured,
  is_breaking: backendArticle.isBreaking,
  views: backendArticle.views,
  published_at: backendArticle.publishedAt,
  created_at: backendArticle.createdAt,
  updated_at: backendArticle.updatedAt,
  seo_title: backendArticle.seoTitle,
  seo_description: backendArticle.seoDescription,
  tags: [], // Backend doesn't have tags in the same format
  category: backendArticle.category ? {
    id: backendArticle.category.id,
    name: backendArticle.category.name,
    slug: backendArticle.category.slug
  } : undefined,
  author: backendArticle.author ? {
    id: backendArticle.author.id,
    name: backendArticle.author.name,
    bio: backendArticle.author.bio,
    avatar: backendArticle.author.avatar
  } : undefined,
  author_name: backendArticle.authorName,
  author_logo: backendArticle.authorLogo
});

// Function to clear all stored data
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.AUTHORS);
    localStorage.removeItem(STORAGE_KEYS.EPAPER_ISSUES);
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.ADS);
    console.log('All stored data cleared');
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
};

// Initialize data on module load
initializeData();