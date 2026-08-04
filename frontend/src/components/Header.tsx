import { Search, Menu, X, Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories, fetchWithTimeout } from '../lib/dataService';
import { API_BASE_URL } from '../config';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: 'partly-cloudy'
  });

  useEffect(() => {
    loadCategories();
    loadWeather();
  }, []);

  const loadCategories = async () => {
    // 1. Populate local categories immediately
    try {
      const data = getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch {
      // Ignore
    }

    // 2. Fetch backend categories silently with timeout
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/categories`, {}, 1000);
      if (response && response.ok) {
        const result = await response.json();
        if (result.success && result.data.categories?.length > 0) {
          setCategories(result.data.categories);
        }
      }
    } catch {
      // Keep local categories
    }
  };

  const loadWeather = async () => {
    try {
      const response = await fetchWithTimeout(
        'https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata',
        {},
        1500
      );

      if (response && response.ok) {
        const data = await response.json();
        const weatherData: WeatherData = {
          temperature: Math.round(data.current.temperature_2m),
          condition: getWeatherConditionFromCode(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          icon: getWeatherIconFromCode(data.current.weather_code)
        };
        setWeather(weatherData);
      } else {
        await loadWeatherFallback();
      }
    } catch {
      await loadWeatherFallback();
    }
  };

  const loadWeatherFallback = async () => {
    try {
      const response = await fetchWithTimeout('https://wttr.in/Coimbatore?format=j1', {}, 1500);

      if (response && response.ok) {
        const data = await response.json();
        const current = data.current_condition[0];
        const weatherData: WeatherData = {
          temperature: Math.round(parseFloat(current.temp_C)),
          condition: current.weatherDesc[0].value,
          humidity: parseInt(current.humidity),
          windSpeed: Math.round(parseFloat(current.windspeedKmph)),
          icon: getWeatherIconFromCondition(current.weatherDesc[0].value.toLowerCase())
        };
        setWeather(weatherData);
      }
    } catch {
      // Keep default weather data
    }
  };

  const getWeatherConditionFromCode = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 66 && code <= 67) return 'Freezing Rain';
    if (code >= 71 && code <= 75) return 'Snow fall';
    if (code === 77) return 'Snow grains';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Partly cloudy';
  };

  const getWeatherIconFromCode = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return 'sunny';
    if (code >= 1 && code <= 3) return 'partly-cloudy';
    if (code >= 45 && code <= 48) return 'cloudy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 86) return 'snowy';
    if (code >= 95 && code <= 99) return 'rainy';
    return 'partly-cloudy';
  };

  const getWeatherIconFromCondition = (condition: string): string => {
    if (condition.includes('sunny') || condition.includes('clear')) return 'sunny';
    if (condition.includes('cloud')) return 'partly-cloudy';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
    if (condition.includes('snow')) return 'snowy';
    if (condition.includes('fog') || condition.includes('mist')) return 'cloudy';
    return 'partly-cloudy';
  };

  const navItems = ['Home', ...categories.map(cat => cat.name), 'E-Paper'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getWeatherIcon = () => {
    const iconProps = { size: 20, className: "text-amber-500" };
    switch (weather.icon) {
      case 'sunny':
        return <Sun {...iconProps} />;
      case 'partly-cloudy':
        return (
          <div className="flex items-center space-x-1">
            <Sun {...iconProps} />
            <Cloud {...iconProps} />
          </div>
        );
      case 'cloudy':
        return <Cloud {...iconProps} />;
      case 'rainy':
        return <CloudRain {...iconProps} />;
      case 'snowy':
        return <CloudSnow {...iconProps} />;
      default:
        return <Sun {...iconProps} />;
    }
  };

  return (
    <header className="bg-white text-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight font-bold font-['Playfair_Display',_'Merriweather',_serif]">
                <span className="text-slate-900 group-hover:text-[#D90429] transition-colors">Prime</span>
                <span className="text-[#D90429] ml-1.5">Tamil</span>
              </h1>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">Premier Digital News Magazine</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {/* Weather Section */}
            <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2">
              {getWeatherIcon()}
              <div className="text-sm">
                <div className="font-bold text-slate-900">{weather.temperature}°C</div>
                <div className="text-xs text-slate-500">Tamil Nadu</div>
              </div>
              <div className="text-xs text-slate-600 border-l border-slate-300 pl-3">
                <div className="flex items-center space-x-1">
                  <Thermometer size={12} className="text-[#D90429]" />
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Wind size={12} className="text-slate-400" />
                  <span className="font-medium">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search articles & news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-full px-4 py-2 pl-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D90429] focus:bg-white w-64 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </form>
          </div>

          <button
            className="lg:hidden text-slate-800 hover:text-[#D90429] transition-colors p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Weather & Search */}
        <div className="lg:hidden flex items-center justify-between py-2.5 border-t border-slate-200">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
            {getWeatherIcon()}
            <div className="text-sm">
              <div className="font-bold text-slate-900">{weather.temperature}°C</div>
              <div className="text-xs text-slate-500">Tamil Nadu</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-xs mx-4">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 pl-9 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D90429] focus:bg-white w-full"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          </form>
        </div>

        <nav className={`${isMenuOpen ? 'block' : 'hidden'} lg:block border-t border-slate-200 py-1.5`}>
          <ul className="flex flex-col lg:flex-row lg:space-x-1 space-y-1 lg:space-y-0">
            {navItems.map((item) => {
              // Find category for navigation
              const category = categories.find(cat => cat.name === item);
              const navSlug = item === 'Home' ? 'home' : item === 'E-Paper' ? 'epaper' : (category?.slug || item.toLowerCase().replace(' ', '-'));

              return (
                <li key={item}>
                  <button
                    onClick={() => {
                      onNavigate(navSlug);
                      setIsMenuOpen(false);
                    }}
                    className={`block py-2 px-4 rounded-full text-sm font-semibold transition-all ${currentPage === navSlug
                      ? 'bg-[#D90429] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#D90429]'
                      }`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
