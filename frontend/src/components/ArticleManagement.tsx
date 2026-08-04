import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import ArticleForm from './ArticleForm';
import {
  getArticles,
  convertBackendArticleToDataService,
  type Article
} from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';
import { API_BASE_URL } from '../config';
import { type AdminUser } from '../App';

const categories = ['Local', 'Education', 'Business', 'Sports', 'Real Estate', 'Lifestyle', 'Events', 'Political', 'Devotional'];
const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  { value: 'published', label: 'Published & Hosted', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' }
];

function getStatusInfo(status: string) {
  return statusOptions.find(s => s.value === status) || statusOptions[0];
}

interface ArticleManagementProps {
  user?: AdminUser;
  initialFilterMode?: 'all' | 'superadmin' | 'subadmin';
}

export const isSubAdminArticle = (article: Article) => {
  if (article.created_by_user_id && article.created_by_user_id !== 'super_admin_1' && !article.created_by_user_id.includes('super')) {
    return true;
  }
  if (article.created_by_special_name && !article.created_by_special_name.toLowerCase().includes('super admin')) {
    return true;
  }
  return false;
};

export default function ArticleManagement({ user, initialFilterMode = 'all' }: ArticleManagementProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'superadmin' | 'subadmin'>(initialFilterMode);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setSourceFilter(initialFilterMode);
  }, [initialFilterMode]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    let loadedArticles: Article[] = [];
    try {
      // Fetch articles from backend API
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          loadedArticles = result.data.articles.map(convertBackendArticleToDataService);
        }
      }
    } catch {
      // Offline fallback
    }

    if (loadedArticles.length === 0) {
      loadedArticles = getArticles();
    }

    // Load extra local storage articles created offline
    try {
      const extra = localStorage.getItem('cbe_custom_articles');
      if (extra) {
        const parsed: Article[] = JSON.parse(extra);
        parsed.forEach(art => {
          if (!loadedArticles.some(a => a.id === art.id)) {
            loadedArticles.unshift(art);
          }
        });
      }
    } catch (err) {
      console.error('Error loading extra local articles:', err);
    }

    setArticles(loadedArticles);
    setLoading(false);
  };

  const filteredArticles = articles.filter(article => {
    // Data isolation for Sub-Admins: only show articles created by this sub-admin!
    if (!isSuperAdmin && user) {
      const isCreator = article.created_by_user_id === user.id ||
        (article.author_name && article.author_name === (user.specialName || user.name)) ||
        (article.created_by_special_name && article.created_by_special_name === (user.specialName || user.name));
      
      if (!isCreator) return false;
    }

    // Separate Super Admin and Sub-Admin articles for Super Admin
    if (isSuperAdmin) {
      if (sourceFilter === 'superadmin' && isSubAdminArticle(article)) return false;
      if (sourceFilter === 'subadmin' && !isSubAdminArticle(article)) return false;
    }

    const author = article.author;
    const category = article.category;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (article.created_by_special_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (category?.name === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateArticleStatus = async (id: string, newStatus: Article['status']) => {
    try {
      await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });
    } catch {
      // Offline mode handling
    }

    // Update in local articles
    setArticles(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : a.published_at
        };
      }
      return a;
    }));

    // Update local storage extra
    try {
      const extra = localStorage.getItem('cbe_custom_articles');
      if (extra) {
        const parsed: Article[] = JSON.parse(extra);
        const updated = parsed.map(a => a.id === id ? { ...a, status: newStatus } : a);
        localStorage.setItem('cbe_custom_articles', JSON.stringify(updated));
      }
    } catch {}
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await fetch(`${API_BASE_URL}/articles/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          }
        });
      } catch {}

      setArticles(prev => prev.filter(a => a.id !== id));
      try {
        const extra = localStorage.getItem('cbe_custom_articles');
        if (extra) {
          const parsed: Article[] = JSON.parse(extra);
          localStorage.setItem('cbe_custom_articles', JSON.stringify(parsed.filter(a => a.id !== id)));
        }
      } catch {}
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleSaveArticle = async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    const articleId = editingArticle ? editingArticle.id : 'art_' + Date.now();

    const fullArticle: Article = {
      id: articleId,
      ...articleData,
      created_by_user_id: articleData.created_by_user_id || user?.id,
      created_by_special_name: articleData.created_by_special_name || user?.specialName || user?.name,
      views: editingArticle ? editingArticle.views : 0,
      created_at: editingArticle ? editingArticle.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const backendData = {
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        categoryId: articleData.category_id,
        authorId: articleData.author_id,
        authorName: articleData.author_name,
        authorLogo: articleData.author_logo,
        images: articleData.images,
        status: articleData.status.toUpperCase(),
        isFeatured: articleData.is_featured,
        isBreaking: articleData.is_breaking,
        seoTitle: articleData.seo_title,
        seoDescription: articleData.seo_description,
        publishedAt: articleData.published_at ? new Date(articleData.published_at + ':00').toISOString() : null
      };

      if (editingArticle) {
        await fetch(`${API_BASE_URL}/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(backendData)
        });
      } else {
        await fetch(`${API_BASE_URL}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(backendData)
        });
      }
    } catch {
      // Offline fallback saving
    }

    // Save to local custom articles storage
    try {
      const extra = localStorage.getItem('cbe_custom_articles');
      const parsed: Article[] = extra ? JSON.parse(extra) : [];
      const existingIdx = parsed.findIndex(a => a.id === fullArticle.id);
      if (existingIdx >= 0) {
        parsed[existingIdx] = fullArticle;
      } else {
        parsed.unshift(fullArticle);
      }
      localStorage.setItem('cbe_custom_articles', JSON.stringify(parsed));
    } catch (err) {
      console.error('Error persisting custom article:', err);
    }

    setShowForm(false);
    setEditingArticle(null);
    loadArticles();
  };

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        user={user}
        onSave={handleSaveArticle}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="text-[#0A1F44] dark:text-blue-400" size={32} />
            {isSuperAdmin ? 'Article Management & Moderation' : 'My News Submissions'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isSuperAdmin
              ? 'Review, edit, and approve news articles submitted by sub-admins before hosting them.'
              : `Logged in as ${user?.name} (${user?.specialName || 'Sub-Admin'}). Submissions will be sent to Super Admin for approval.`}
          </p>
        </div>
        <button
          onClick={handleCreateArticle}
          className="bg-[#0A1F44] text-white px-5 py-2.5 rounded-xl hover:bg-[#1a3a6e] transition flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          <span className="font-semibold">Create News Article</span>
        </button>
      </div>

      {/* Super Admin Source Filter Tabs */}
      {isSuperAdmin && (
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 gap-2 pt-2">
          <button
            onClick={() => setSourceFilter('all')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              sourceFilter === 'all'
                ? 'border-[#0A1F44] text-[#0A1F44] dark:text-blue-400 dark:border-blue-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <FileText size={18} />
            All News Articles ({articles.length})
          </button>

          <button
            onClick={() => setSourceFilter('superadmin')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              sourceFilter === 'superadmin'
                ? 'border-[#0A1F44] text-[#0A1F44] dark:text-blue-400 dark:border-blue-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <ShieldAlert size={18} className="text-blue-600 dark:text-blue-400" />
            Super Admin Main News ({articles.filter(a => !isSubAdminArticle(a)).length})
          </button>

          <button
            onClick={() => setSourceFilter('subadmin')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 relative ${
              sourceFilter === 'subadmin'
                ? 'border-[#D90429] text-[#D90429] dark:text-red-400 dark:border-red-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <UserCheck size={18} className="text-[#D90429] dark:text-red-400" />
            Sub-Admin Submissions ({articles.filter(isSubAdminArticle).length})
            {articles.filter(a => isSubAdminArticle(a) && a.status === 'review').length > 0 && (
              <span className="ml-1.5 bg-[#D90429] text-white text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {articles.filter(a => isSubAdminArticle(a) && a.status === 'review').length} Pending
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search news by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] outline-none dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg outline-none dark:bg-gray-700 dark:text-white font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="review">Under Review</option>
          <option value="published">Published & Hosted</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg outline-none dark:bg-gray-700 dark:text-white font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Article Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posted By (Admin Alias)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Published Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArticles.map((article) => {
                const statusInfo = getStatusInfo(article.status);
                const displayAdminName = article.created_by_special_name || article.author_name || article.author?.name || 'Admin';

                return (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-12 w-16 rounded-lg object-cover flex-shrink-0 border"
                          src={getImageUrl(article.images && article.images.length > 0 ? article.images[0] : '')}
                          alt={article.title}
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate">
                            {article.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Admin Creator Info */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                        <UserCheck size={16} className="text-blue-600" />
                        <span>{displayAdminName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {article.category?.name || 'Local'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.published_at)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Super Admin Approve & Host Button */}
                        {isSuperAdmin && article.status !== 'published' && (
                          <button
                            onClick={() => handleUpdateArticleStatus(article.id, 'published')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow transition"
                            title="Approve and host news on public site"
                          >
                            <CheckCircle size={14} /> Approve & Host
                          </button>
                        )}

                        {/* Super Admin Unpublish Button */}
                        {isSuperAdmin && article.status === 'published' && (
                          <button
                            onClick={() => handleUpdateArticleStatus(article.id, 'review')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow transition"
                            title="Unpublish news to review state"
                          >
                            <XCircle size={14} /> Move to Review
                          </button>
                        )}

                        <button
                          onClick={() => handleEditArticle(article)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition"
                          title="Edit News Article"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition"
                          title="Delete News Article"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShieldAlert className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="font-bold text-gray-700 dark:text-gray-300">No News Articles Found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isSuperAdmin
                        ? 'No articles match your filter criteria.'
                        : 'You have not submitted any news articles yet. Click "Create News Article" to submit one for Super Admin approval!'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}