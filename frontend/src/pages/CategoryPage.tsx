import { useEffect, useState } from 'react';
import { getCategoryBySlug, getArticlesByCategory, getTrendingArticles, getMostReadArticles, convertToNewsDataArticle, convertBackendArticleToFrontend, fetchWithTimeout } from '../lib/dataService';
import { API_BASE_URL } from '../config';
import { getSidebarAds, type SidebarAd } from '../lib/sidebarData';
import { type Article } from '../lib/newsData';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (page: string) => void;
}

export default function CategoryPage({ categorySlug, onNavigate }: CategoryPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [sidebarAds, setSidebarAds] = useState<SidebarAd[]>([]);
  const articlesPerPage = 12;

  useEffect(() => {
    loadArticles();
  }, [categorySlug, page]);

  const loadArticles = async () => {
    try {
      let backendArticles: any[] = [];
      let localArticles: any[] = [];
      let categoryNameFromBackend = '';

      // Try to fetch from backend API first with timeout
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/categories/slug/${categorySlug}?page=${page}&limit=${articlesPerPage}`, {}, 1000);
        if (response && response.ok) {
          const result = await response.json();
          if (result.success) {
            const categoryData = result.data.category;
            categoryNameFromBackend = categoryData.name;
            backendArticles = categoryData.articles.map(convertBackendArticleToFrontend);
            setHasMore(result.data.pagination.hasNextPage);
          }
        }
      } catch {
        // Backend offline, fallback to local data
      }

      // Also get local articles for this category
      const category = getCategoryBySlug(categorySlug);
      if (category) {
        if (!categoryNameFromBackend) {
          setCategoryName(category.name);
        } else {
          setCategoryName(categoryNameFromBackend);
        }

        const localData = getArticlesByCategory(category.id).map(convertToNewsDataArticle);
        localArticles = localData;
      }

      // Combine backend and local articles, remove duplicates by slug
      const allArticles = [...backendArticles];
      localArticles.forEach(localArticle => {
        if (!allArticles.some(backendArticle => backendArticle.slug === localArticle.slug)) {
          allArticles.push(localArticle);
        }
      });

      // Sort by published date (newest first)
      allArticles.sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime());

      // Simple pagination
      const start = (page - 1) * articlesPerPage;
      const end = start + articlesPerPage;
      const paginatedData = allArticles.slice(start, end);

      if (page === 1) {
        setArticles(paginatedData);
      } else {
        setArticles((prev) => [...prev, ...paginatedData]);
      }

      // Check if there are more articles
      const totalArticles = allArticles.length;
      setHasMore(page * articlesPerPage < totalArticles);

      // Load sidebar content
      const trending = getTrendingArticles().map(convertToNewsDataArticle);
      const mostRead = getMostReadArticles().map(convertToNewsDataArticle);
      const ads = getSidebarAds('category');

      setTrendingArticles(trending);
      setMostReadArticles(mostRead);
      setSidebarAds(ads);
    } catch (error) {
      console.error('Error loading articles:', error);
      // Final fallback to local data only
      try {
        const category = getCategoryBySlug(categorySlug);
        if (category) {
          setCategoryName(category.name);
          const data = getArticlesByCategory(category.id).map(convertToNewsDataArticle);
          const start = (page - 1) * articlesPerPage;
          const end = start + articlesPerPage;
          const paginatedData = data.slice(start, end);

          if (page === 1) {
            setArticles(paginatedData);
          } else {
            setArticles((prev) => [...prev, ...paginatedData]);
          }
          setHasMore(page * articlesPerPage < data.length);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC]">
      <Header onNavigate={onNavigate} currentPage={categorySlug} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <div className="mb-8 pb-4 border-b border-slate-200 flex items-center space-x-3">
              <span className="w-2 h-8 bg-[#D90429] rounded-full inline-block"></span>
              <div>
                <span className="text-xs font-extrabold tracking-wider uppercase text-[#D90429]">Editorial Section</span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif] uppercase leading-tight">{categoryName}</h1>
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
                <p className="text-slate-600 text-base font-medium mb-4">No articles found in this editorial section yet.</p>
                <button
                  onClick={() => onNavigate('home')}
                  className="bg-[#D90429] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition shadow-sm"
                >
                  Return to Magazine Home
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="small"
                      onNavigate={(slug) => onNavigate(`article/${slug}`)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={loading}
                      className="bg-[#D90429] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
                    >
                      {loading ? 'Loading...' : 'Load More Articles'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
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
