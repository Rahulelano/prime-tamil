import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface BreakingNewsItem {
  id: string;
  title: string;
}

interface BreakingNewsProps {
  items: BreakingNewsItem[];
}

export default function BreakingNews({ items }: BreakingNewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-red-50 border-y border-red-100 text-slate-900 py-2.5 overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        <div className="flex items-center space-x-1.5 bg-[#D90429] text-white px-3 py-1 rounded-full mr-4 flex-shrink-0 shadow-sm">
          <Zap size={14} className="fill-current" />
          <span className="font-extrabold text-xs uppercase tracking-wider">Prime Alert</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item) => (
              <span key={item.id} className="inline-block w-full text-sm font-semibold text-slate-800 hover:text-[#D90429] cursor-pointer transition-colors">
                {item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
