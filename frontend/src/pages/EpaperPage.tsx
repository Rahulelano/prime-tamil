import { useEffect, useState } from 'react';
import { Download, Calendar, FileText, ArrowLeft, Eye, X, Share2 } from 'lucide-react';
import { getEpaperIssuesAPI, downloadEpaperAPI, type EpaperIssue } from '../lib/dataService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface EpaperPageProps {
  onNavigate: (page: string) => void;
}

export default function EpaperPage({ onNavigate }: EpaperPageProps) {
  const [epapers, setEpapers] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<EpaperIssue | null>(null);

  useEffect(() => {
    loadEpapers();
  }, []);

  const loadEpapers = async () => {
    try {
      const epaperData = await getEpaperIssuesAPI();
      setEpapers(epaperData);
    } catch (error) {
      console.error('Error loading e-papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (epaper: EpaperIssue) => {
    const dateStr = new Date(epaper.issueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const shareData = {
      title: epaper.title || 'Prime Tamil E-Paper Edition',
      text: `Read the Prime Tamil Digital Magazine edition from ${dateStr}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col justify-between">
      <div>
        <Header onNavigate={onNavigate} currentPage="epaper" />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-slate-600 hover:text-[#D90429] mb-4 text-sm font-semibold transition"
            >
              <ArrowLeft size={18} />
              Back to Magazine Home
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">E-Paper Archive</h1>
            <div className="h-1.5 w-24 bg-[#D90429] rounded-full mb-3"></div>
            <p className="text-slate-600 text-sm">
              Explore and download complete digital editions of Prime Tamil.
            </p>
          </div>

          {epapers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
              <FileText size={44} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">No E-Papers Available</h2>
              <p className="text-slate-500 text-sm">Digital editions will be published here very soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {epapers.map((epaper) => (
                <div
                  key={epaper.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-red-50 text-[#D90429] flex items-center justify-center flex-shrink-0 border border-red-100">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-snug font-['Playfair_Display',_'Merriweather',_serif]">
                          {epaper.title || 'Prime Tamil Digital Edition'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mt-1">
                          <Calendar size={13} className="text-[#D90429]" />
                          <span>
                            {new Date(epaper.issueDate).toLocaleDateString('en-IN', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                      <span>
                        {epaper.pageCount} Pages
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        High-Res PDF
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPdf(epaper)}
                        className="flex-1 bg-slate-900 text-white py-2.5 px-4 rounded-full text-xs font-bold hover:bg-[#D90429] transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye size={14} />
                        Read
                      </button>
                      <a
                        href={downloadEpaperAPI(epaper.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`prime-tamil-${epaper.issueDate.split('T')[0]}.pdf`}
                        className="flex-1 bg-slate-100 text-slate-800 py-2.5 px-4 rounded-full text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Download size={14} />
                        Download
                      </a>
                      <button
                        onClick={() => handleShare(epaper)}
                        className="w-10 h-10 bg-red-50 text-[#D90429] rounded-full hover:bg-[#D90429] hover:text-white transition flex items-center justify-center border border-red-100"
                        title="Share Edition"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
                <h2 className="text-lg font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">
                  {selectedPdf.title || 'Prime Tamil'} — {new Date(selectedPdf.issueDate).toLocaleDateString('en-IN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPdf(null)}
                className="p-1.5 text-slate-500 hover:text-[#D90429] hover:bg-red-50 rounded-full transition"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 p-4 bg-slate-100">
              <iframe
                src={downloadEpaperAPI(selectedPdf.id)}
                className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-inner"
                title={`E-Paper ${selectedPdf.issueDate}`}
              />
            </div>
            <div className="flex gap-3 p-4 px-6 border-t border-slate-200 bg-white">
              <a
                href={downloadEpaperAPI(selectedPdf.id)}
                target="_blank"
                rel="noopener noreferrer"
                download={`prime-tamil-${selectedPdf.issueDate.split('T')[0]}.pdf`}
                className="flex-1 bg-[#D90429] text-white py-2.5 px-6 rounded-full text-sm font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} />
                Download PDF Edition
              </a>
              <button
                onClick={() => setSelectedPdf(null)}
                className="px-8 bg-slate-100 text-slate-700 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
