import { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import EpaperPage from './pages/EpaperPage';
import SearchPage from './pages/SearchPage';

export interface AdminUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN' | string;
  name: string;
  specialName?: string;
}

type PageType = 'home' | 'admin' | 'article' | 'category' | 'epaper' | 'search';

interface PageState {
  type: PageType;
  slug?: string;
  query?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>({ type: 'home' });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('cbe_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Check for direct URL access to admin
    if (window.location.pathname === '/admin') {
      setCurrentPage({ type: 'admin' });
    }
  }, []);

  const handleAdminLogin = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('cbe_current_user', JSON.stringify(user));
    setCurrentPage({ type: 'admin' });
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('cbe_current_user');
    setCurrentPage({ type: 'home' });
  };

  const handleNavigate = (page: string) => {
    // Enhanced navigation handling
    if (page === 'admin') {
      setCurrentPage({ type: 'admin' });
    } else if (page === 'home') {
      setCurrentPage({ type: 'home' });
    } else if (page === 'epaper') {
      setCurrentPage({ type: 'epaper' });
    } else if (page.startsWith('article/')) {
      const slug = page.replace('article/', '');
      setCurrentPage({ type: 'article', slug });
    } else if (page.startsWith('search?q=')) {
      const query = decodeURIComponent(page.replace('search?q=', ''));
      setCurrentPage({ type: 'search', query });
    } else {
      // Handle category navigation
      const categorySlug = page;
      setCurrentPage({ type: 'category', slug: categorySlug });
    }
  };

  // If admin is logged in, show admin dashboard
  if (currentPage.type === 'admin' && adminUser) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        user={adminUser}
      />
    );
  }

  // If in admin login flow
  if (currentPage.type === 'admin') {
    return (
      <AdminLogin onLogin={handleAdminLogin} />
    );
  }

  // Handle article pages
  if (currentPage.type === 'article' && currentPage.slug) {
    return <ArticlePage slug={currentPage.slug} onNavigate={handleNavigate} />;
  }

  // Handle category pages
  if (currentPage.type === 'category' && currentPage.slug) {
    return <CategoryPage categorySlug={currentPage.slug} onNavigate={handleNavigate} />;
  }

  // Handle epaper pages
  if (currentPage.type === 'epaper') {
    return <EpaperPage onNavigate={handleNavigate} />;
  }

  // Handle search pages
  if (currentPage.type === 'search') {
    return <SearchPage query={currentPage.query || ''} onNavigate={handleNavigate} />;
  }

  // Default: Show home page as landing page
  return <HomePage onNavigate={handleNavigate} />;
}

export default App;
