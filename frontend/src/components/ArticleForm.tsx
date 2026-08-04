import { useState, useEffect } from 'react';
import { X, Save, Eye, Loader, Tag } from 'lucide-react';

import { type Article, getCategories } from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';
import { uploadFile } from '../lib/upload';
import { API_BASE_URL } from '../config';

import { type AdminUser } from '../App';

interface ArticleFormProps {
  article?: Article | null;
  user?: AdminUser;
  onSave: (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>) => void;
  onCancel: () => void;
  onPreview?: (article: Article) => void;
}

export default function ArticleForm({ article, user, onSave, onCancel, onPreview }: ArticleFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultStatus = user?.role === 'SUB_ADMIN' ? ('review' as const) : ('published' as const);
  const defaultAuthorName = user?.specialName || user?.name || '';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: defaultStatus as Article['status'],
    category_id: '',
    author_id: '',
    images: [] as string[],
    published_at: '',
    seo_title: '',
    seo_description: '',
    tags: [] as string[],
    is_featured: false,
    is_breaking: false,
    author_name: defaultAuthorName,
    author_logo: '',
    created_by_user_id: user?.id || '',
    created_by_special_name: user?.specialName || user?.name || ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories from backend API
      const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
      let categoriesData;
      if (categoriesResponse.ok) {
        const result = await categoriesResponse.json();
        if (result.success) {
          categoriesData = result.data.categories;
        } else {
          console.error('Failed to load categories:', result.message);
          categoriesData = getCategories(); // Fallback
        }
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.status);
        categoriesData = getCategories(); // Fallback
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading form data:', error);
      try {
        setCategories(await getCategories());
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: article.status,
        category_id: article.category_id,
        author_id: article.author_id,
        images: article.images,
        published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        tags: article.tags,
        is_featured: article.is_featured,
        is_breaking: article.is_breaking,
        author_name: article.author_name || defaultAuthorName,
        author_logo: article.author_logo || '',
        created_by_user_id: article.created_by_user_id || user?.id || '',
        created_by_special_name: article.created_by_special_name || user?.specialName || user?.name || ''
      });
    } else {
      // Reset form for new article
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: user?.role === 'SUB_ADMIN' ? 'review' : 'published',
        category_id: '',
        author_id: '',
        images: [],
        published_at: '',
        seo_title: '',
        seo_description: '',
        tags: [],
        is_featured: false,
        is_breaking: false,
        author_name: defaultAuthorName,
        author_logo: '',
        created_by_user_id: user?.id || '',
        created_by_special_name: user?.specialName || user?.name || ''
      });
    }
  }, [article, user]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters long';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.trim().length < 10) {
      newErrors.excerpt = 'Excerpt must be at least 10 characters long';
    } else if (formData.excerpt.trim().length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    if (!formData.category_id) newErrors.category = 'Category is required';
    // Author validation: either ID or Name required
    if (!formData.author_id && !formData.author_name) {
      newErrors.author = 'Author name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const articleData = {
      ...formData,
      updated_at: new Date().toISOString(),
      ...(article ? {} : { created_at: new Date().toISOString() })
    };

    onSave(articleData);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed a reasonable limit (e.g., 10 images)
    if (formData.images.length + files.length > 10) {
      setErrors({ ...errors, images: 'Maximum 10 images allowed' });
      return;
    }

    setUploadingImage(true);
    setErrors({ ...errors, images: '' });

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select valid image files only');
        }

        // Validate file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Each image must be less than 5MB');
        }

        const result = await uploadFile(file, 'articles');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setErrors({ ...errors, images: error instanceof Error ? error.message : 'Failed to upload images. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAuthorLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, author_logo: 'Please select valid image file' });
      return;
    }

    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, author_logo: 'Logo must be less than 2MB' });
      return;
    }

    try {
      setErrors({ ...errors, author_logo: '' });
      // Use a generic placeholder while uploading if needed, or just wait
      const result = await uploadFile(file, 'authors');
      setFormData(prev => ({
        ...prev,
        author_logo: result.url
      }));
    } catch (error) {
      console.error('Author logo upload failed:', error);
      setErrors({ ...errors, author_logo: 'Failed to upload logo' });
    }
  };

  const handlePreview = () => {
    if (article) {
      const previewArticle: Article = {
        ...article,
        ...formData,
        updated_at: new Date().toISOString()
      };
      onPreview?.(previewArticle);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0A1F44]"></div>
            <span className="text-gray-900 dark:text-white">Loading form data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Enter article title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="article-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.excerpt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Brief summary of the article"
                  />
                  {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value, author_id: '' }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="Enter author name"
                    />
                    {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author Logo
                    </label>
                    <div className="flex items-center space-x-3">
                      {formData.author_logo && (
                        <img
                          src={getImageUrl(formData.author_logo)}
                          alt="Author Logo"
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAuthorLogoUpload}
                        className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#0A1F44] file:text-white hover:file:bg-[#1a3a6e]"
                      />
                    </div>
                    {errors.author_logo && <p className="text-red-500 text-xs mt-1">{errors.author_logo}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Images
                  </label>
                  <div className="space-y-3">
                    {/* Images Preview */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={getImageUrl(image)}
                              alt={`Image ${index + 1} preview`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                              title="Remove image"
                            >
                              <X size={10} />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-[#0A1F44] text-white text-xs px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#0A1F44] file:text-white hover:file:bg-[#1a3a6e]"
                      />
                      {uploadingImage && (
                        <div className="flex items-center px-3 py-2">
                          <Loader size={16} className="animate-spin text-[#0A1F44]" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload multiple images. The first image will be used as the featured image in article cards.
                    </p>

                    {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={20}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Write your article content here..."
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0A1F44] text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a6e] transition"
                >
                  <Tag size={16} />
                </button>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO Settings</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Custom SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Custom SEO description"
                  />
                </div>
              </div>
            </div>

            {/* Article Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Article Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-gray-300 text-[#0A1F44] focus:ring-[#0A1F44]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured Article</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D90429] focus:ring-[#D90429]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Breaking News</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Article['status'] }))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Under Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              {onPreview && (
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a6e] transition flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{article ? 'Update Article' : 'Create Article'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
// Force update