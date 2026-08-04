import { useState, useEffect } from 'react';
import { Plus, Upload, Eye, Trash2, Download, Calendar } from 'lucide-react';
import {
  getEpaperIssuesAPI,
  addEpaperIssueAPI,
  updateEpaperIssueAPI,
  deleteEpaperIssueAPI,
  downloadEpaperAPI,
  type EpaperIssue
} from '../lib/dataService';

interface EpaperManagementProps {
  onError?: (message: string) => void;
}

export default function EpaperManagement({ onError }: EpaperManagementProps) {
  const [epapers, setEpapers] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEpaper, setEditingEpaper] = useState<EpaperIssue | null>(null);
  const [formData, setFormData] = useState({
    issueDate: '',
    title: '',
    description: '',
    pageCount: 1,
    status: 'PUBLISHED'
  });
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadEpapers();
  }, []);

  const loadEpapers = async () => {
    try {
      const epaperData = await getEpaperIssuesAPI();
      setEpapers(epaperData);
    } catch (error) {
      console.error('Error loading e-papers:', error);
      onError?.('Failed to load e-papers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: 'pdf' | 'cover') => {
    if (type === 'pdf') {
      setSelectedPdf(file);
    } else {
      setSelectedCoverImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEpaper) {
        // Update existing e-paper
        await updateEpaperIssueAPI(editingEpaper.id, formData);
      } else {
        // Create new e-paper with FormData
        const submitData = new FormData();
        submitData.append('issueDate', formData.issueDate);
        submitData.append('title', formData.title || '');
        submitData.append('description', formData.description || '');
        submitData.append('pageCount', formData.pageCount.toString());
        submitData.append('status', formData.status);

        if (selectedPdf) {
          submitData.append('pdf', selectedPdf);
        }

        if (selectedCoverImage) {
          submitData.append('coverImage', selectedCoverImage);
        }

        await addEpaperIssueAPI(submitData);
      }

      // Reload epapers to reflect changes
      await loadEpapers();
      resetForm();
    } catch (error) {
      console.error('Error saving e-paper:', error);
      onError?.('Failed to save e-paper');
    }
  };

  const handleEdit = (epaper: EpaperIssue) => {
    setEditingEpaper(epaper);
    setFormData({
      issueDate: epaper.issueDate.split('T')[0], // Convert to YYYY-MM-DD format
      title: epaper.title || '',
      description: epaper.description || '',
      pageCount: epaper.pageCount,
      status: epaper.status
    });
    setSelectedPdf(null);
    setSelectedCoverImage(null);
    setShowForm(true);
  };

  const handleDelete = async (epaperId: string) => {
    if (!confirm('Are you sure you want to delete this e-paper? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEpaperIssueAPI(epaperId);
      // Reload epapers to reflect changes
      await loadEpapers();
    } catch (error) {
      console.error('Error deleting e-paper:', error);
      onError?.('Failed to delete e-paper');
    }
  };

  const resetForm = () => {
    setFormData({
      issueDate: '',
      title: '',
      description: '',
      pageCount: 1,
      status: 'PUBLISHED'
    });
    setSelectedPdf(null);
    setSelectedCoverImage(null);
    setEditingEpaper(null);
    setShowForm(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">E-Paper Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Upload and manage digital newspaper editions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a6e] transition flex items-center gap-2"
        >
          <Plus size={18} />
          Upload E-Paper
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingEpaper ? 'Edit E-Paper' : 'Upload New E-Paper'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="E.g., Coimbatore Express - November 25, 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Brief description of this e-paper issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PDF File {!editingEpaper && '*'}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pdf');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={!editingEpaper}
                  />
                  {selectedPdf && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedPdf.name} ({(selectedPdf.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {editingEpaper && !selectedPdf && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current PDF will be kept if no new file is selected
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'cover');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {selectedCoverImage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedCoverImage.name} ({(selectedCoverImage.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {editingEpaper && !selectedCoverImage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current cover image will be kept if no new file is selected
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Pages
                </label>
                <input
                  type="number"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#0A1F44] text-white py-2 px-4 rounded-lg hover:bg-[#1a3a6e] transition"
                  disabled={uploading}
                >
                  {editingEpaper ? 'Update' : 'Upload'}
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

      {/* E-Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {epapers.map((epaper) => (
          <div key={epaper.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="relative">
              <img
                src={epaper.coverImage || '/news (1).jpeg'}
                alt={`E-Paper ${epaper.issueDate}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-[#0A1F44] text-white text-xs px-2 py-1 rounded">
                {epaper.pageCount} pages
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(epaper.issueDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {epaper.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {epaper.title}
                </h3>
              )}

              <div className="flex gap-2 mt-4">
                <a
                  href={downloadEpaperAPI(epaper.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#0A1F44] text-white text-center py-2 px-4 rounded hover:bg-[#1a3a6e] transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </a>
                <button
                  onClick={() => handleEdit(epaper)}
                  className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Edit"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDelete(epaper.id)}
                  className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {epapers.length === 0 && (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No e-papers uploaded yet. Upload your first digital edition.</p>
        </div>
      )}
    </div>
  );
}