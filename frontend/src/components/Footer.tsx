import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200 mt-auto shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start cursor-pointer group" onClick={() => onNavigate('home')}>
            <h3 className="text-2xl font-bold tracking-tight font-['Playfair_Display',_'Merriweather',_serif] group-hover:opacity-90 transition">
              <span className="text-slate-900">Prime</span>
              <span className="text-[#D90429] ml-1.5">Tamil</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Premier Digital News Magazine of Tamil Nadu</p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 text-center font-medium">
            © {currentYear} Prime Tamil. All Rights Reserved. Designed for editorial excellence.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-3">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] transition-all shadow-sm">
              <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] transition-all shadow-sm">
              <Instagram size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] transition-all shadow-sm">
              <Twitter size={16} />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] transition-all shadow-sm">
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
