import { useEffect, useState } from 'react';
import { Calendar, User, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, getTrendingArticles, getMostReadArticles, convertToNewsDataArticle, fetchWithTimeout } from '../lib/dataService';
import { API_BASE_URL } from '../config';
import { type Article } from '../lib/newsData';
import { getSidebarAds, type SidebarAd } from '../lib/sidebarData';
import { getImageUrl } from '../lib/cloudinary';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

interface ArticlePageProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export default function ArticlePage({ slug, onNavigate }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [articleImages, setArticleImages] = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [sidebarAds, setSidebarAds] = useState<SidebarAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      // 1. Populate with local data first for instant response
      const localData = getArticleBySlug(slug);
      if (localData) {
        const convertedArticle = convertToNewsDataArticle(localData);
        setArticle(convertedArticle);

        const related = getRelatedArticles(localData.id, localData.category_id, 3);
        setRelatedArticles(related.map(convertToNewsDataArticle));
      }

      const localTrending = getTrendingArticles();
      setTrendingArticles(localTrending.map(convertToNewsDataArticle));

      const localMostRead = getMostReadArticles();
      setMostReadArticles(localMostRead.map(convertToNewsDataArticle));

      setSidebarAds(getSidebarAds('article'));
      setLoading(false);

      // 2. Attempt to fetch backend article with timeout
      let articleData: any = null;
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/articles/${slug}`, {}, 1000);
        if (response && response.ok) {
          const result = await response.json();
          if (result.success && result.data.article) {
            articleData = result.data.article;
            const convertedArticle: Article = {
              id: articleData.id,
              title: articleData.title,
              slug: articleData.slug,
              excerpt: articleData.excerpt,
              content: articleData.content,
              featured_image_url: articleData.images && articleData.images.length > 0 ? articleData.images[0] : '',
              category_id: articleData.categoryId,
              author_id: articleData.authorId,
              is_featured: articleData.isFeatured,
              is_breaking: articleData.isBreaking,
              views: articleData.views,
              published_at: articleData.publishedAt,
              categories: articleData.category ? {
                id: articleData.category.id,
                name: articleData.category.name,
                slug: articleData.category.slug,
                description: articleData.category.description || ''
              } : undefined,
              authors: articleData.author ? {
                id: articleData.author.id,
                name: articleData.author.name,
                bio: articleData.author.bio,
                avatar_url: articleData.author.avatar,
                email: articleData.author.email || ''
              } : undefined,
              author_name: articleData.authorName,
              author_logo: articleData.authorLogo
            };
            setArticle(convertedArticle);
            setArticleImages(articleData.images || []);

            const relatedResponse = await fetchWithTimeout(`${API_BASE_URL}/articles?category=${articleData.categoryId}&limit=3`, {}, 1000);
            if (relatedResponse && relatedResponse.ok) {
              const relatedResult = await relatedResponse.json();
              if (relatedResult.success) {
                const related = relatedResult.data.articles
                  .filter((a: any) => a.id !== articleData.id)
                  .slice(0, 3)
                  .map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    slug: a.slug,
                    excerpt: a.excerpt,
                    content: a.content,
                    featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
                    category_id: a.categoryId,
                    author_id: a.authorId,
                    is_featured: a.isFeatured,
                    is_breaking: a.isBreaking,
                    views: a.views,
                    published_at: a.publishedAt,
                    categories: a.category ? {
                      id: a.category.id,
                      name: a.category.name,
                      slug: a.category.slug,
                      description: a.category.description || ''
                    } : undefined,
                    authors: a.author ? {
                      id: a.author.id,
                      name: a.author.name,
                      bio: a.author.bio,
                      avatar_url: a.author.avatar,
                      email: a.author.email || ''
                    } : undefined,
                    author_name: a.authorName,
                    author_logo: a.authorLogo
                  }));
                setRelatedArticles(related);
              }
            }
          }
        }
      } catch {
        // Backend offline, keep local article
      }

      // Try backend for trending articles
      try {
        const trendingResponse = await fetchWithTimeout(`${API_BASE_URL}/articles/trending/list`, {}, 1000);
        if (trendingResponse && trendingResponse.ok) {
          const trendingResult = await trendingResponse.json();
          if (trendingResult.success && trendingResult.data.articles.length > 0) {
            setTrendingArticles(trendingResult.data.articles.map((a: any) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              content: a.content,
              featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
              category_id: a.categoryId,
              author_id: a.authorId,
              is_featured: a.isFeatured,
              is_breaking: a.isBreaking,
              views: a.views,
              published_at: a.publishedAt,
              categories: a.category ? {
                id: a.category.id,
                name: a.category.name,
                slug: a.category.slug,
                description: a.category.description || ''
              } : undefined,
              authors: a.author ? {
                id: a.author.id,
                name: a.author.name,
                bio: a.author.bio,
                avatar_url: a.author.avatar,
                email: a.author.email || ''
              } : undefined
            })));
          }
        }
      } catch {
        // Keep local trending
      }

      // Try backend for most read articles
      try {
        const mostReadResponse = await fetchWithTimeout(`${API_BASE_URL}/articles/trending/list?sort=publishedAt`, {}, 1000);
        if (mostReadResponse && mostReadResponse.ok) {
          const mostReadResult = await mostReadResponse.json();
          if (mostReadResult.success && mostReadResult.data.articles.length > 0) {
            setMostReadArticles(mostReadResult.data.articles.slice(0, 5).map((a: any) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              content: a.content,
              featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
              category_id: a.categoryId,
              author_id: a.authorId,
              is_featured: a.isFeatured,
              is_breaking: a.isBreaking,
              views: a.views,
              published_at: a.publishedAt,
              categories: a.category ? {
                id: a.category.id,
                name: a.category.name,
                slug: a.category.slug,
                description: a.category.description || ''
              } : undefined,
              authors: a.author ? {
                id: a.author.id,
                name: a.author.name,
                bio: a.author.bio,
                avatar_url: a.author.avatar,
                email: a.author.email || ''
              } : undefined
            })));
          }
        }
      } catch {
        // Keep local most read
      }

    } catch (error) {
      console.error('Error loading article:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col justify-between">
        <Header onNavigate={onNavigate} currentPage="article" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span className="bg-red-50 text-[#D90429] font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-full mb-3 shadow-sm tracking-wider">
            404 Editorial Notice
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 font-['Playfair_Display',_'Merriweather',_serif]">Article Not Found</h1>
          <p className="text-slate-600 max-w-md mb-6 text-sm">The article you are looking for may have been archived or moved to another section.</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#D90429] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Return to Magazine Home
          </button>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC]">
      <Header onNavigate={onNavigate} currentPage="article" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Takes 2/3 width on larger screens */}
          <div className="w-full lg:w-2/3">
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              {article.categories && (
                <button
                  onClick={() => onNavigate(article.categories!.slug)}
                  className="bg-red-50 text-[#D90429] hover:bg-[#D90429] hover:text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm"
                >
                  {article.categories.name}
                </button>
              )}

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight font-['Playfair_Display',_'Merriweather',_serif]">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                {(article.author_name || article.authors) && (
                  <div className="flex items-center space-x-2">
                    {(article.author_logo || article.authors?.avatar_url) && (
                      <img
                        src={article.author_logo ? getImageUrl(article.author_logo) : article.authors?.avatar_url}
                        alt={article.author_name || article.authors?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span className="font-semibold">{article.author_name || article.authors?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Calendar size={12} />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* First image - big below the topic */}
              {articleImages.length > 0 && getImageUrl(articleImages[0]) && (
                <div className="mb-8">
                  <img
                    src={getImageUrl(articleImages[0])}
                    alt={`${article.title} - Image 1`}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none mb-8 font-serif">
                {/* Second image - floated right in the content */}
                {articleImages.length > 1 && getImageUrl(articleImages[1]) && (
                  <div className="float-right ml-6 mb-4 w-1/2 md:w-1/3">
                    <img
                      src={getImageUrl(articleImages[1])}
                      alt={`${article.title} - Image 2`}
                      className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.display = 'none';
                      }}
                    />
                    {/* Optional caption if we had one */}
                  </div>
                )}

                <p className="text-xl text-slate-800 font-medium leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:text-[#D90429] first-letter:mr-3 first-letter:float-left">
                  {article.excerpt}
                </p>

                <div className="text-slate-800 leading-relaxed text-justify space-y-4 font-['Plus_Jakarta_Sans',_sans-serif] text-base">
                  {article.content.split('\n\n').map((paragraph, index) => {
                    // Start from third image (index 2) since index 0 is hero and index 1 is floated right
                    const imageIndex = index + 2;

                    return (
                      <div key={index}>
                        <p className="mb-4 leading-8">
                          {paragraph}
                        </p>
                        {/* Intersperse remaining images between paragraphs if any */}
                        {articleImages.length > 2 && imageIndex < articleImages.length && getImageUrl(articleImages[imageIndex]) && (
                          <div className="my-8">
                            <img
                              src={getImageUrl(articleImages[imageIndex])}
                              alt={`${article.title} - Image ${imageIndex + 1}`}
                              className="w-full h-auto rounded-xl shadow-sm border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Clear floats */}
                <div className="clear-both"></div>
              </div>
            </article>

            {relatedArticles.length > 0 && (
              <section className="mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                <div className="flex items-center space-x-2.5 mb-6 pb-4 border-b border-slate-100">
                  <span className="w-1.5 h-6 bg-[#D90429] rounded-full inline-block"></span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-['Playfair_Display',_'Merriweather',_serif] uppercase">You May Also Like</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.slice(0, 3).map((relatedArticle) => (
                    <ArticleCard
                      key={relatedArticle.id}
                      article={relatedArticle}
                      size="small"
                      onNavigate={(slug) => onNavigate(`article/${slug}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Takes 1/3 width on larger screens */}
          <div className="w-full lg:w-1/3">
            {/* About Author */}
            {article.authors && article.authors.bio && (
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm mb-6">
                <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
                  <h3 className="font-bold text-lg text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">About the Author</h3>
                </div>
                <div className="flex items-start space-x-4">
                  {article.authors.avatar_url && (
                    <img
                      src={article.authors.avatar_url}
                      alt={article.authors.name}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{article.authors.name}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{article.authors.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Sharing */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm mb-6">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
                <h3 className="font-bold text-lg text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Share This Article</h3>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => shareArticle('facebook')}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <Facebook size={20} />
                </button>
                <button
                  onClick={() => shareArticle('twitter')}
                  className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition"
                >
                  <Twitter size={20} />
                </button>
                <button
                  onClick={() => shareArticle('linkedin')}
                  className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition"
                >
                  <Linkedin size={20} />
                </button>
                <button
                  onClick={() => shareArticle('whatsapp')}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enhanced Sidebar with videos and ads */}
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