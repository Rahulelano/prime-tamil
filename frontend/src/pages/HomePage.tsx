import { useEffect, useState } from 'react';
import {
  getFeaturedArticles,
  getBreakingNews,
  getTrendingArticles,
  getMostReadArticles,
  getArticlesByCategory,
  getCategories,
  convertToNewsDataArticle,
  convertBackendArticleToFrontend,
  fetchWithTimeout
} from '../lib/dataService';
import { API_BASE_URL } from '../config';
import { getImageUrl } from '../lib/cloudinary';
import { type Article } from '../lib/newsData';
import { type SidebarAd } from '../lib/sidebarData';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import BreakingNews from '../components/BreakingNews';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdDisplay from '../components/AdDisplay';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [subFeatured, setSubFeatured] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<{ [key: string]: Article[] }>({});
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [sidebarAds, setSidebarAds] = useState<SidebarAd[]>([]);
  const [hero, setHero] = useState<{ title: string; image: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      // 1. Load local data immediately for instant response
      const featured = getFeaturedArticles().map(convertToNewsDataArticle);
      if (featured.length > 0) {
        setFeaturedArticle(featured[0]);
        if (featured.length > 1) {
          setSubFeatured(featured.slice(1, 4));
        }
      // Check if custom hero was set by Admin
      try {
        const localHeroStr = localStorage.getItem('cbe_hero');
        if (localHeroStr) {
          const localHero = JSON.parse(localHeroStr);
          if (localHero.isActive && localHero.title) {
            setHero({
              title: localHero.title,
              image: localHero.imageUrl,
              description: localHero.description
            });
          }
        }
      } catch (err) {
        console.error('Error reading cbe_hero in HomePage:', err);
      }
      }

      const breaking = getBreakingNews().map(convertToNewsDataArticle);
      setBreakingNews(breaking);

      const categoryData: { [key: string]: Article[] } = {};
      const allCategories = getCategories();
      for (const category of allCategories) {
        const localArticles = getArticlesByCategory(category.id).map(convertToNewsDataArticle);
        if (localArticles.length > 0) {
          categoryData[category.name] = localArticles;
        }
      }
      setCategoryArticles(categoryData);

      const trending = getTrendingArticles().map(convertToNewsDataArticle);
      const mostRead = getMostReadArticles().map(convertToNewsDataArticle);
      setTrendingArticles(trending);
      setMostReadArticles(mostRead);
      setSidebarAds([]);

      // Mark initial load complete immediately so UI is interactive
      setLoading(false);

      // 2. Attempt background fetch from API with timeout to augment/override with live backend data if available
      try {
        const catResponse = await fetchWithTimeout(`${API_BASE_URL}/categories`, {}, 1000);
        if (catResponse && catResponse.ok) {
          const result = await catResponse.json();
          if (result.success && result.data.categories) {
            const apiCategories = result.data.categories;
            const updatedCategoryData = { ...categoryData };

            await Promise.all(apiCategories.map(async (category: any) => {
              const res = await fetchWithTimeout(`${API_BASE_URL}/categories/slug/${category.slug}?limit=4`, {}, 1000);
              if (res && res.ok) {
                const categoryResult = await res.json();
                if (categoryResult.success && categoryResult.data.category.articles.length > 0) {
                  updatedCategoryData[category.name] = categoryResult.data.category.articles.map(convertBackendArticleToFrontend);
                }
              }
            }));
            setCategoryArticles(updatedCategoryData);
          }
        }
      } catch {
        // Backend not available, keep local category data
      }

      // Fetch trending from backend silently
      try {
        const trendingResponse = await fetchWithTimeout(`${API_BASE_URL}/articles/trending/list`, {}, 1000);
        if (trendingResponse && trendingResponse.ok) {
          const trendingResult = await trendingResponse.json();
          if (trendingResult.success && trendingResult.data.articles.length > 0) {
            setTrendingArticles(trendingResult.data.articles.map(convertBackendArticleToFrontend));
          }
        }
      } catch {
        // Keep local trending
      }

      // Fetch hero from backend silently
      try {
        const heroResponse = await fetchWithTimeout(`${API_BASE_URL}/hero`, {}, 1000);
        if (heroResponse && heroResponse.ok) {
          const heroResult = await heroResponse.json();
          if (heroResult.success && heroResult.data.hero) {
            setHero({
              title: heroResult.data.hero.title,
              image: heroResult.data.hero.imageUrl,
              description: heroResult.data.hero.description
            });
          }
        }
      } catch {
        // Keep local hero state
      }

    } catch (error) {
      console.error('Error loading articles:', error);
      setLoading(false);
    }
  };



  // Helper function to render articles with ads for mobile view
  const renderArticlesWithMobileAds = (articles: Article[], adPositions: string[]) => {
    const elements: JSX.Element[] = [];
    let adIndex = 0;

    articles.forEach((article, index) => {
      elements.push(
        <ArticleCard
          key={article.id}
          article={article}
          size="small"
          onNavigate={(slug) => onNavigate(`article/${slug}`)}
        />
      );

      // Insert ad after every 2 articles in mobile view
      if ((index + 1) % 2 === 0 && adIndex < adPositions.length) {
        elements.push(
          <div key={`mobile-ad-${index}`} className="md:hidden">
            <AdDisplay
              position={adPositions[adIndex % adPositions.length]}
              page="home"
              size="300x250"
              className="bg-white p-4 rounded-lg shadow mb-6"
            />
          </div>
        );
        adIndex++;
      }
    });

    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="home" />



      {/* Hero Section */}
      {hero && hero.title && (
        <section className="relative h-72 md:h-[420px] max-w-7xl mx-auto mt-4 px-4 overflow-hidden">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
            {hero.image && (
              <img
                src={getImageUrl(hero.image)}
                alt={hero.title}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6 md:p-10">
              <div className="text-white max-w-4xl">
                <span className="bg-[#D90429] text-white font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3 shadow-sm">
                  Prime Cover Story
                </span>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 leading-tight font-['Playfair_Display',_'Merriweather',_serif]">{hero.title}</h1>
                {hero.description && (
                  <p className="text-sm md:text-base opacity-90 text-slate-200 font-medium line-clamp-2">{hero.description}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-4">
        <BreakingNews items={breakingNews.map(a => ({ id: a.id, title: a.title }))} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Takes 2/3 width on larger screens */}
          <div className="w-full lg:w-2/3 space-y-8">
            {featuredArticle && (
              <section>
                <ArticleCard
                  article={featuredArticle}
                  size="large"
                  onNavigate={(slug) => onNavigate(`article/${slug}`)}
                />
              </section>
            )}

            {subFeatured.length > 0 && (
              <section>
                {/* Mobile view: articles with ads */}
                <div className="md:hidden space-y-6">
                  {renderArticlesWithMobileAds(subFeatured, ['sidebar-top', 'sidebar-middle', 'sidebar-bottom'])}
                </div>
                {/* Desktop view: grid layout */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {subFeatured.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="medium"
                      onNavigate={(slug) => onNavigate(`article/${slug}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            <AdDisplay position="header" page="home" size="728x90" />

            {Object.entries(categoryArticles).map(([categoryName, articles]) => {
              if (articles.length === 0) return null;

              return (
                <section key={categoryName} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-1.5 h-6 bg-[#D90429] rounded-full inline-block"></span>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-['Playfair_Display',_'Merriweather',_serif] uppercase">{categoryName}</h2>
                    </div>
                    <button
                      onClick={() => onNavigate(categoryName.toLowerCase().replace(' ', '-'))}
                      className="text-xs font-extrabold text-[#D90429] hover:bg-red-50 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 uppercase tracking-wider"
                    >
                      View All →
                    </button>
                  </div>
                  {/* Mobile view: articles with ads */}
                  <div className="md:hidden space-y-6">
                    {renderArticlesWithMobileAds(articles.slice(0, 4), ['sidebar-top', 'sidebar-middle', 'sidebar-bottom'])}
                  </div>
                  {/* Desktop view: grid layout */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {articles.slice(0, 6).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        size="small"
                        onNavigate={(slug) => onNavigate(`article/${slug}`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Sidebar - Takes 1/3 width on larger screens */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Ad Space */}
            <AdDisplay position="sidebar-top" page="home" size="300x250" className="bg-white p-4 rounded-lg shadow" />

            {/* Advertisement Section */}
            <AdDisplay position="sidebar-middle" page="home" size="300x250" className="bg-white p-4 rounded-lg shadow" />

            {/* More Ad Space */}
            <AdDisplay position="sidebar-bottom" page="home" size="300x600" className="bg-white p-4 rounded-lg shadow" />
            <Sidebar
              trendingArticles={trendingArticles}
              mostReadArticles={mostReadArticles}
              onNavigate={onNavigate}
              sidebarAds={sidebarAds}
            />
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
