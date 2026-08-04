import { useEffect, useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { searchArticles, convertToNewsDataArticle } from '../lib/dataService';
import { type Article } from '../lib/newsData';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface SearchPageProps {
  query: string;
  onNavigate: (page: string) => void;
}

export default function SearchPage({ query, onNavigate }: SearchPageProps) {
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const searchResults = searchArticles(searchTerm);
      const convertedResults = searchResults.map(convertToNewsDataArticle);
      setResults(convertedResults.slice(0, 20));
    } catch (error) {
      console.error('Error searching articles:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col justify-between">
      <div>
        <Header onNavigate={onNavigate} currentPage="search" />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-slate-600 hover:text-[#D90429] mb-4 text-sm font-semibold transition"
            >
              <ArrowLeft size={18} />
              Back to Magazine Home
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">Search Magazine</h1>
            <div className="h-1.5 w-24 bg-[#D90429] rounded-full mb-6"></div>

            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics & reports..."
                  className="w-full px-6 py-4 pr-14 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none transition text-base shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-[#D90429] text-white p-3 rounded-full hover:bg-red-700 transition shadow-sm"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
            </div>
          ) : query ? (
            <>
              <div className="mb-6">
                <p className="text-slate-600 text-sm">
                  {results.length === 0 ? 'No results' : `${results.length} result${results.length !== 1 ? 's' : ''}`} found for <span className="font-bold text-slate-900">"{query}"</span>
                </p>
              </div>

              {results.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
                  <Search size={44} className="mx-auto text-slate-300 mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">No articles found</h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Try checking your spelling or search for different keywords
                  </p>
                  <button
                    onClick={() => onNavigate('home')}
                    className="bg-[#D90429] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition shadow-sm"
                  >
                    Back to Magazine Home
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="small"
                      onNavigate={(slug) => onNavigate(`article/${slug}`)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
              <Search size={44} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">Start searching</h2>
              <p className="text-slate-500 text-sm">Enter a keyword above to discover stories across Prime Tamil</p>
            </div>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
