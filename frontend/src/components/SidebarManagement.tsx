import { useState, useEffect } from 'react';
import { Image, Edit, Trash2, Eye, EyeOff, Monitor } from 'lucide-react';
import {
  type SidebarAd
} from '../lib/sidebarData';
import { addAd, updateAd, deleteAd } from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';


interface SidebarManagementProps {
  onError?: (message: string) => void;
}

export default function SidebarManagement({ onError }: SidebarManagementProps) {
  const [ads, setAds] = useState<SidebarAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState<SidebarAd | null>(null);

  const [adFormData, setAdFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    size: '300x250',
    position: 'sidebar',
    page: 'all',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadSidebarContent();
  }, []);

  const loadSidebarContent = async () => {
    try {
      const allAds = [
        {
          id: '1',
          title: 'Brookefields Mall',
          imageUrl: '/news (3).jpeg',
          linkUrl: 'https://brookefields.com',
          size: '300x250',
          position: 'sidebar',
          isActive: true,
          impressions: 15420,
          clicks: 234,
          startDate: '2025-11-01',
          endDate: '2025-12-31',
          createdAt: '2025-11-01T10:00:00Z'
        },
        {
          id: '2',
          title: 'Restaurant Ad',
          imageUrl: '/news (4).jpeg',
          linkUrl: 'https://restaurant.com',
          size: '300x250',
          position: 'sidebar',
          isActive: true,
          impressions: 8750,
          clicks: 156,
          startDate: '2025-10-15',
          endDate: '2025-11-15',
          createdAt: '2025-10-15T14:30:00Z'
        }
      ];

      setAds(allAds);
    } catch (error) {
      console.error('Error loading sidebar content:', error);
      onError?.('Failed to load sidebar content');
    } finally {
      setLoading(false);
    }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        updateAd(editingAd.id, adFormData);
      } else {
        addAd(adFormData);
      }
      loadSidebarContent(); // Reload data
      resetAdForm();
    } catch (error) {
      console.error('Error saving ad:', error);
      onError?.('Failed to save advertisement');
    }
  };

  const handleAdEdit = (ad: SidebarAd) => {
    setEditingAd(ad);
    setAdFormData({
      title: ad.title,
      description: ad.title, // Using title as description fallback
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      size: ad.size,
      position: ad.position,
      page: 'all', // Default for existing ads
      isActive: ad.isActive,
      startDate: ad.startDate,
      endDate: ad.endDate
    });
    setShowAdForm(true);
  };

  const handleAdDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }
    try {
      deleteAd(adId);
      loadSidebarContent(); // Reload data
    } catch (error) {
      console.error('Error deleting ad:', error);
      onError?.('Failed to delete advertisement');
    }
  };

  const toggleAdActive = async (adId: string) => {
    try {
      const updatedAds = ads.map(ad =>
        ad.id === adId ? { ...ad, isActive: !ad.isActive } : ad
      );
      setAds(updatedAds);
    } catch (error) {
      console.error('Error toggling ad status:', error);
      onError?.('Failed to update advertisement status');
    }
  };

  const resetAdForm = () => {
    setAdFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      size: '300x250',
      position: 'sidebar',
      page: 'all',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingAd(null);
    setShowAdForm(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sidebar Advertisement Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage advertisements displayed in the sidebar</p>
        </div>
        <button
          onClick={() => setShowAdForm(true)}
          className="bg-[#D90429] text-white px-4 py-2 rounded-lg hover:bg-[#b80320] transition flex items-center gap-2"
        >
          <Image size={18} />
          Add Advertisement
        </button>
      </div>

      {/* Ad Form Modal */}
      {showAdForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingAd ? 'Edit Sidebar Ad' : 'Add Sidebar Ad'}
            </h2>

            <form onSubmit={handleAdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={adFormData.imageUrl}
                    onChange={(e) => setAdFormData({ ...adFormData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={adFormData.linkUrl}
                    onChange={(e) => setAdFormData({ ...adFormData, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Size
                  </label>
                  <select
                    value={adFormData.size}
                    onChange={(e) => setAdFormData({ ...adFormData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="300x250">300x250 (Rectangle)</option>
                    <option value="300x600">300x600 (Half Page)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position
                  </label>
                  <select
                    value={adFormData.position}
                    onChange={(e) => setAdFormData({ ...adFormData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="sidebar">Sidebar</option>
                    <option value="header">Header</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={adFormData.startDate}
                    onChange={(e) => setAdFormData({ ...adFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={adFormData.endDate}
                    onChange={(e) => setAdFormData({ ...adFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={adFormData.isActive}
                    onChange={(e) => setAdFormData({ ...adFormData, isActive: e.target.checked })}
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
                  {editingAd ? 'Update' : 'Add Ad'}
                </button>
                <button
                  type="button"
                  onClick={resetAdForm}
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
                  Size
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {ad.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{ad.impressions.toLocaleString()} impressions</div>
                    <div>{ad.clicks.toLocaleString()} clicks</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ad.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleAdActive(ad.id)}
                      className={`inline-flex items-center p-1 rounded-full ${
                        ad.isActive
                          ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          : 'text-green-400 hover:text-green-600'
                      }`}
                      title={ad.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleAdEdit(ad)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center p-1 rounded-full"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleAdDelete(ad.id)}
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
            <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No sidebar advertisements found. Add your first ad to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}