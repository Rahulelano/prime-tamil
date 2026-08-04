import { useState } from 'react';
import {
  FileText,
  Megaphone,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  Star,
  Shield,
  UserCheck
} from 'lucide-react';
import ArticleManagement from '../components/ArticleManagement';
import AdsManagement from '../components/AdsManagement';
import EpaperManagement from '../components/EpaperManagement';
import HeroManagement from '../components/HeroManagement';
import SubAdminManagement from '../components/SubAdminManagement';
import { AdminUser } from '../App';

interface AdminDashboardProps {
  onLogout: () => void;
  user: AdminUser;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  user: AdminUser;
  onLogout: () => void;
}

function AdminLayout({ children, currentPage, onPageChange, user, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const navigationItems = isSuperAdmin ? [
    { id: 'articles', label: 'Main Articles', icon: FileText },
    { id: 'subadmin_articles', label: 'Sub-Admin News', icon: UserCheck },
    { id: 'subadmins', label: 'Sub-Admins', icon: Shield },
    { id: 'hero', label: 'Hero Section', icon: Star },
    { id: 'epaper', label: 'E-Paper', icon: FileText },
    { id: 'ads', label: 'Advertisements', icon: Megaphone },
  ] : [
    { id: 'articles', label: 'News Articles', icon: FileText },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-[#0A1F44] dark:text-white">News Admin</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-[#0A1F44] text-white border-r-4 border-[#D90429]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                >
                  <Menu size={24} />
                </button>
                
                {/* Search Bar */}
                <div className="hidden md:block relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {user.name} {user.specialName ? `(${user.specialName})` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminDashboard({ onLogout, user }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState('articles');

  const renderPage = () => {
    switch (currentPage) {
      case 'articles':
        return <ArticleManagement user={user} initialFilterMode="all" />;
      case 'subadmin_articles':
        return <ArticleManagement user={user} initialFilterMode="subadmin" />;
      case 'subadmins':
        return user.role === 'SUPER_ADMIN' ? <SubAdminManagement /> : <ArticleManagement user={user} />;
      case 'hero':
        return user.role === 'SUPER_ADMIN' ? <HeroManagement /> : <ArticleManagement user={user} />;
      case 'epaper':
        return user.role === 'SUPER_ADMIN' ? <EpaperManagement /> : <ArticleManagement user={user} />;
      case 'ads':
        return user.role === 'SUPER_ADMIN' ? <AdsManagement /> : <ArticleManagement user={user} />;
      default:
        return <ArticleManagement user={user} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      user={user} 
      onLogout={onLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
}