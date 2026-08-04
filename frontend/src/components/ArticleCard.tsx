import { Calendar, User } from 'lucide-react';
import type { Article } from '../lib/newsData';
import { getImageUrl } from '../lib/cloudinary';

interface ArticleCardProps {
  article: Article;
  size?: 'small' | 'medium' | 'large';
  onNavigate: (slug: string) => void;
}

export default function ArticleCard({ article, size = 'medium', onNavigate }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const cardClasses = {
    small: 'flex flex-col',
    medium: 'flex flex-col',
    large: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  };

  const imageClasses = {
    small: 'aspect-[4/3] w-full',
    medium: 'aspect-[4/3] w-full',
    large: 'aspect-[4/3] w-full md:h-full'
  };

  const titleClasses = {
    small: 'text-base font-bold',
    medium: 'text-xl font-bold',
    large: 'text-3xl font-bold'
  };

  return (
    <article
      onClick={() => onNavigate(article.slug)}
      className="bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className={`${cardClasses[size]} flex-1`}>
        <div className={`${imageClasses[size]} overflow-hidden bg-slate-100 relative`}>
          <img
            src={getImageUrl(article.featured_image_url || '')}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {article.categories && size !== 'small' && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#D90429] text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                {article.categories.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {article.categories && size === 'small' && (
              <span className="text-[11px] font-extrabold text-[#D90429] uppercase tracking-wider block mb-1">
                {article.categories.name}
              </span>
            )}
            <h3 className={`${titleClasses[size]} text-slate-900 group-hover:text-[#D90429] transition-colors mt-1 mb-2.5 leading-snug font-['Playfair_Display',_'Merriweather',_serif]`}>
              {article.title}
            </h3>
            {size !== 'small' && (
              <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            {(article.author_name || article.authors) && (
              <div className="flex items-center space-x-1.5 text-slate-700">
                {(article.author_logo || article.authors?.avatar_url) ? (
                  <img
                    src={article.author_logo ? getImageUrl(article.author_logo) : article.authors?.avatar_url}
                    alt={article.author_name || article.authors?.name}
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-50 text-[#D90429] flex items-center justify-center">
                    <User size={12} />
                  </div>
                )}
                <span className="font-semibold line-clamp-1">{article.author_name || article.authors?.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-slate-500 ml-auto">
              <Calendar size={13} className="text-[#D90429]" />
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
