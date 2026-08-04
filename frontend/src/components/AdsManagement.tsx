import { useState, useEffect } from 'react';
import { Plus, Image, Monitor, Smartphone, Edit, Trash2, Eye, EyeOff, Loader, X } from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';
import { uploadFile } from '../lib/upload';
import { getAds, addAd, updateAd, deleteAd, toggleAdActive, type Ad } from '../lib/dataService';

interface AdsManagementProps {
  onError?: (message: string) => void;
}

export default function AdsManagement({ onError }: AdsManagementProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'sidebar',
    page: 'all', // 'all' means show on all pages
    size: '300x250',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const data = getAds();
      setAds(data);
    } catch (error) {
      console.error('Error loading ads:', error);
      onError?.('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        onError?.('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError?.('Image size must be less than 5MB');
        return;
      }

      const result = await uploadFile(file, 'ads');
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      onError?.(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        // Update existing ad
        updateAd(editingAd.id, formData);
      } else {
        // Create new ad
        addAd(formData);
      }

      // Reload ads
      loadAds();
      resetForm();
    } catch (error) {
      console.error('Error saving ad:', error);
      onError?.('Failed to save advertisement');
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      position: ad.position,
      page: ad.page,
      size: ad.size,
      isActive: ad.isActive,
      startDate: ad.startDate,
      endDate: ad.endDate
    });
    setShowForm(true);
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      return;
    }

    try {
      deleteAd(adId);
      loadAds(); // Reload ads
    } catch (error) {
      console.error('Error deleting ad:', error);
      onError?.('Failed to delete advertisement');
    }
  };

  const toggleActive = async (adId: string) => {
    try {
      toggleAdActive(adId);
      loadAds(); // Reload ads
    } catch (error) {
      console.error('Error toggling ad status:', error);
      onError?.('Failed to update advertisement status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'sidebar',
      page: 'all',
      size: '300x250',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'header':
        return <Monitor size={16} />;
      case 'sidebar-top':
      case 'sidebar-middle':
      case 'sidebar-bottom':
        return <Image size={16} />;
      case 'mobile':
        return <Smartphone size={16} />;
      default:
        return <Image size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A1F44]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertisement Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage banner ads and sponsored content</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#D90429] text-white px-4 py-2 rounded-lg hover:bg-[#b80320] transition flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Ad
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ads</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{ads.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Ads</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {ads.filter(ad => ad.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {ads.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
              <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {ads.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
              <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad Image *
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <div className="relative">
                        <img
                          src={getImageUrl(formData.imageUrl)}
                          alt="Ad image preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#D90429] file:text-white hover:file:bg-[#b80320]"
                      />
                      {uploading && (
                        <div className="flex items-center px-3 py-2">
                          <Loader size={16} className="animate-spin text-[#D90429]" />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="header">Header (728x90)</option>
                    <option value="sidebar-top">Sidebar Top (300x250)</option>
                    <option value="sidebar-middle">Sidebar Middle (300x250)</option>
                    <option value="sidebar-bottom">Sidebar Bottom (300x600)</option>
                    <option value="mobile">Mobile Banner</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page
                  </label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Pages</option>
                    <option value="home">Home Page</option>
                    <option value="article">Article Pages</option>
                    <option value="category">Category Pages</option>
                    <option value="search">Search Page</option>
                    <option value="about">About Page</option>
                    <option value="contact">Contact Page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="728x90">728x90 (Leaderboard)</option>
                  <option value="300x250">300x250 (Rectangle)</option>
                  <option value="320x50">320x50 (Mobile)</option>
                  <option value="300x600">300x600 (Half Page)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-[#D90429] focus:ring-[#D90429]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D90429] text-white py-2 px-4 rounded-lg hover:bg-[#b80320] transition"
                >
                  {editingAd ? 'Update' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(ad.imageUrl)}
                        alt={ad.title}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ad.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(ad.position)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {ad.position.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {ad.page === 'all' ? 'All Pages' : ad.page}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{ad.impressions.toLocaleString()} impressions</div>
                    <div>{ad.clicks.toLocaleString()} clicks</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}% CTR
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ad.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleActive(ad.id)}
                      className={`inline-flex items-center p-1 rounded-full ${ad.isActive
                          ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          : 'text-green-400 hover:text-green-600'
                        }`}
                      title={ad.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center p-1 rounded-full"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center p-1 rounded-full"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <Image size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No advertisements found. Create your first ad to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}