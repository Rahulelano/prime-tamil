import { TrendingUp, Eye } from 'lucide-react';
import type { Article } from '../lib/newsData';
import { getImageUrl } from '../lib/cloudinary';

interface SidebarAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  size: string;
  isActive: boolean;
}

interface SidebarProps {
  trendingArticles: Article[];
  mostReadArticles: Article[];
  onNavigate: (slug: string) => void;
  showAds?: boolean;
  sidebarAds?: SidebarAd[];
}

export default function Sidebar({
  trendingArticles,
  mostReadArticles,
  onNavigate,
  showAds = true,
  sidebarAds = []
}: SidebarProps) {

  return (
    <aside className="space-y-6">

      {/* Trending Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex items-center space-x-2 mb-5 pb-3 border-b border-slate-100">
          <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
          <TrendingUp className="text-[#D90429]" size={18} />
          <h3 className="font-bold text-slate-900 tracking-tight text-lg font-['Playfair_Display',_'Merriweather',_serif]">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {trendingArticles.slice(0, 5).map((article, index) => (
            <div
              key={article.id}
              onClick={() => onNavigate(`article/${article.slug}`)}
              className="flex items-start space-x-3 cursor-pointer group pt-1"
            >
              <span className="text-xl font-black text-[#D90429] bg-red-50 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                0{index + 1}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#D90429] transition-colors leading-snug">
                  {article.title}
                </h4>
                <p className="text-[11px] font-extrabold text-[#D90429] uppercase tracking-wider mt-1">
                  {article.categories?.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex items-center space-x-2 mb-5 pb-3 border-b border-slate-100">
          <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
          <Eye className="text-[#D90429]" size={18} />
          <h3 className="font-bold text-slate-900 tracking-tight text-lg font-['Playfair_Display',_'Merriweather',_serif]">Recent Articles</h3>
        </div>
        <div className="space-y-4">
          {mostReadArticles.slice(0, 5).map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate(`article/${article.slug}`)}
              className="cursor-pointer group border-b border-slate-100 last:border-0 pb-3 last:pb-0"
            >
              <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#D90429] transition-colors leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center mt-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <span className="text-[#D90429]">{article.categories?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Sidebar Ads */}
      {showAds && sidebarAds.filter(ad => ad.isActive).map((ad) => (
        <div key={ad.id} className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Advertisement</p>
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="w-full h-48 object-cover rounded hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      ))}

      {/* Default Ad Space if no active ads */}
      {showAds && sidebarAds.filter(ad => ad.isActive).length === 0 && (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Advertisement</p>
          <div className="bg-white h-48 rounded flex items-center justify-center text-gray-400">
            300x250
          </div>
        </div>
      )}
    </aside>
  );
}
