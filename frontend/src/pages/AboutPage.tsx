import { Target, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">About Prime Tamil</h1>
        <div className="h-1.5 w-24 bg-[#D90429] rounded-full"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-slate-800 leading-relaxed mb-6 font-medium">
            Welcome to <strong>Prime Tamil</strong> — your premier digital news magazine and authoritative source for comprehensive,
            insightful, and timely coverage across Tamil Nadu and beyond.
          </p>

          <p className="text-slate-600 leading-relaxed mb-6">
            In an era of rapid news cycles, we believe that quality journalism and deep analysis matter more than ever.
            Prime Tamil was founded with an editorial commitment to deliver fast, verified, and engaging stories
            that shape politics, culture, economy, and community living.
          </p>

          <p className="text-slate-600 leading-relaxed">
            From breaking updates and governance to industry trends, educational breakthroughs, cultural highlights,
            and inspiring human interest features, we are dedicated to being the definitive digital voice of our region.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Our Mission</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            To deliver fearless, factual, and richly contextual journalism that empowers our readers to stay
            critically informed, intellectually inspired, and closely connected.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Editorial Integrity</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Uncompromising accuracy, thorough verification, and transparency guide our newsroom. We serve the public
            interest and uphold the highest standard of editorial excellence.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Readers First</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            We are built around our community. Your stories, diverse perspectives, and intellectual curiosity
            inspire our investigative features and daily reporting.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Modern Digital Magazine</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Combining editorial elegance with cutting-edge digital experiences, interactive features, and rapid
            updates accessible seamlessly across all devices.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 text-slate-900">
        <h2 className="text-2xl font-bold mb-6 font-['Playfair_Display',_'Merriweather',_serif] border-b pb-3 border-slate-100">What We Cover</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-3 text-slate-700 text-sm font-medium">
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>State Governance & Public Policy</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Economy, Startups & Industry Dynamics</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Education, Research & Academic Excellence</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Sports, Tournaments & Athletic Feats</span>
            </li>
          </ul>
          <ul className="space-y-3 text-slate-700 text-sm font-medium">
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Infrastructure, Smart Cities & Development</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Arts, Cinema, Literature & Lifestyle</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Regional Festivals & Cultural Celebrations</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-[#D90429] rounded-full"></div>
              <span>Opinion, Columns & Editorial Essays</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 font-['Playfair_Display',_'Merriweather',_serif]">Join Our Readers Circle</h2>
        <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto text-sm">
          Prime Tamil continues to expand its reach. Whether you have a news tip, want to partner with us, or
          wish to join our editorial contributors, we welcome your voice.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="mailto:editor@primetamil.com"
            className="bg-[#D90429] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-red-700 transition shadow-sm"
          >
            Contact Editors
          </a>
          <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-full font-semibold text-sm hover:bg-slate-900 hover:text-white transition">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}
