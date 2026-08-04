import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  BookOpen,
  TrendingUp,
  MoreVertical,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Globe
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Author {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  role: 'admin' | 'editor' | 'author' | 'reporter';
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  last_active: string;
  total_articles: number;
  total_views: number;
  total_comments: number;
  specialties: string[];
  social_links: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
  location: string;
  verified: boolean;
}

const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'Coimbatore Express Staff',
    email: 'staff@coimbatoreexpress.com',
    phone: '+91 98765 43210',
    bio: 'Our dedicated team of local journalists covering news from Coimbatore and surrounding areas. We focus on delivering accurate, timely news that matters to our community.',
    avatar: '',
    role: 'admin',
    status: 'active',
    join_date: '2023-01-15',
    last_active: '2025-11-10T05:00:00Z',
    total_articles: 156,
    total_views: 89500,
    total_comments: 1234,
    specialties: ['Local News', 'Community Events', 'Politics'],
    social_links: {
      twitter: 'https://twitter.com/ctstaff',
      linkedin: 'https://linkedin.com/company/coimbatore-express',
    },
    location: 'Coimbatore, Tamil Nadu',
    verified: true
  },
  {
    id: '2',
    name: 'Sports Correspondent',
    email: 'sports@coimbatoreexpress.com',
    phone: '+91 98765 43211',
    bio: 'Covering local sports and athletic events in Coimbatore and beyond. Passionate about bringing you the latest updates on cricket, football, athletics, and emerging sports.',
    avatar: '',
    role: 'editor',
    status: 'active',
    join_date: '2023-03-22',
    last_active: '2025-11-10T04:30:00Z',
    total_articles: 89,
    total_views: 45600,
    total_comments: 567,
    specialties: ['Sports', 'Cricket', 'Football', 'Athletics'],
    social_links: {
      twitter: 'https://twitter.com/sportsct',
    },
    location: 'Coimbatore, Tamil Nadu',
    verified: true
  },
  {
    id: '3',
    name: 'Business Reporter',
    email: 'business@coimbatoreexpress.com',
    phone: '+91 98765 43212',
    bio: 'Reporting on local business and economic developments. Specializing in industry analysis, startup coverage, and economic trends affecting the Coimbatore region.',
    avatar: '',
    role: 'author',
    status: 'active',
    join_date: '2023-06-10',
    last_active: '2025-11-10T03:45:00Z',
    total_articles: 67,
    total_views: 32400,
    total_comments: 345,
    specialties: ['Business', 'Economy', 'Startups', 'Industry'],
    social_links: {
      linkedin: 'https://linkedin.com/in/business-reporter-ct',
      website: 'https://businessreporter.com'
    },
    location: 'Coimbatore, Tamil Nadu',
    verified: true
  },
  {
    id: '4',
    name: 'Education Correspondent',
    email: 'education@coimbatoreexpress.com',
    phone: '+91 98765 43213',
    bio: 'Covering education news, school updates, and academic developments in the Coimbatore educational ecosystem. Passionate about student welfare and academic excellence.',
    avatar: '',
    role: 'reporter',
    status: 'active',
    join_date: '2023-08-05',
    last_active: '2025-11-09T18:20:00Z',
    total_articles: 43,
    total_views: 18900,
    total_comments: 234,
    specialties: ['Education', 'Schools', 'Universities', 'Students'],
    social_links: {},
    location: 'Coimbatore, Tamil Nadu',
    verified: false
  }
];

const roleOptions = [
  { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800', icon: Shield },
  { value: 'editor', label: 'Editor', color: 'bg-blue-100 text-blue-800', icon: Edit },
  { value: 'author', label: 'Author', color: 'bg-green-100 text-green-800', icon: User },
  { value: 'reporter', label: 'Reporter', color: 'bg-yellow-100 text-yellow-800', icon: BookOpen },
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800', icon: AlertCircle },
];

function getRoleInfo(role: string) {
  return roleOptions.find(r => r.value === role) || roleOptions[0];
}

function getStatusInfo(status: string) {
  return statusOptions.find(s => s.value === status) || statusOptions[0];
}

export default function AuthorManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    role: 'author' as Author['role'],
    status: 'active' as Author['status'],
    specialties: [] as string[],
    social_links: {
      twitter: '',
      linkedin: '',
      facebook: '',
      website: ''
    },
    location: '',
    verified: false
  });
  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/authors?status=all`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const authorsData = result.data.authors.map((author: any) => ({
            id: author.id,
            name: author.name,
            email: author.email,
            phone: author.phone || '',
            bio: author.bio,
            avatar: author.avatar || '',
            role: author.role.toLowerCase() as Author['role'],
            status: author.status.toLowerCase() as Author['status'],
            join_date: author.createdAt,
            last_active: author.lastActive || author.createdAt,
            total_articles: author._count?.articles || 0,
            total_views: 0, // Would need to calculate from articles
            total_comments: 0, // Would need to calculate from articles
            specialties: author.specialties || [],
            social_links: author.socialLinks || {
              twitter: '',
              linkedin: '',
              facebook: '',
              website: ''
            },
            location: author.location || '',
            verified: author.verified || false
          }));
          setAuthors(authorsData);
        }
      }
    } catch (error) {
      console.error('Error loading authors:', error);
      // Fallback to mock data if backend fails
      setAuthors(mockAuthors);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || author.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || author.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const updateAuthorStatus = (id: string, newStatus: Author['status']) => {
    setAuthors(prev => prev.map(author =>
      author.id === id
        ? { ...author, status: newStatus, last_active: new Date().toISOString() }
        : author
    ));
  };

  const deleteAuthor = (id: string) => {
    if (confirm('Are you sure you want to remove this author? This action cannot be undone.')) {
      setAuthors(prev => prev.filter(author => author.id !== id));
    }
  };

  const handleCreateAuthor = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      // Try to create author via backend API
      const response = await fetch(`${API_BASE_URL}/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          role: formData.role.toUpperCase(),
          specialties: formData.specialties,
          socialLinks: formData.social_links,
          location: formData.location || undefined,
          verified: formData.verified
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add to local state
          setAuthors(prev => [...prev, {
            ...formData,
            id: result.data.author.id,
            join_date: new Date().toISOString(),
            last_active: new Date().toISOString(),
            total_articles: 0,
            total_views: 0,
            total_comments: 0
          }]);
          setShowCreateModal(false);
          resetForm();
          alert('Author created successfully!');
        } else {
          alert('Failed to create author: ' + result.message);
        }
      } else {
        // Fallback to localStorage if backend fails
        const newAuthor: Author = {
          ...formData,
          id: Date.now().toString(),
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          total_articles: 0,
          total_views: 0,
          total_comments: 0
        };

        setAuthors(prev => [...prev, newAuthor]);
        setShowCreateModal(false);
        resetForm();
        alert('Author created locally (backend not available)');
      }
    } catch (error) {
      console.error('Error creating author:', error);
      alert('Error creating author. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      bio: '',
      avatar: '',
      role: 'author',
      status: 'active',
      specialties: [],
      social_links: {
        twitter: '',
        linkedin: '',
        facebook: '',
        website: ''
      },
      location: '',
      verified: false
    });
    setSpecialtyInput('');
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActive = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1F44]"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading authors...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authors & Editors</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your content team and their permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-2">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a6e] transition flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add New Author</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Authors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{authors.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Authors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {authors.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {authors.reduce((sum, author) => sum + author.total_articles, 0)}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(authors.reduce((sum, author) => sum + author.total_views, 0) / 1000).toFixed(1)}K
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Authors Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => {
            const roleInfo = getRoleInfo(author.role);
            const statusInfo = getStatusInfo(author.status);
            const RoleIcon = roleInfo.icon;
            const StatusIcon = statusInfo.icon;

            return (
              <div key={author.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {author.avatar ? (
                            <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        {author.verified && (
                          <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-white dark:bg-gray-800 rounded-full" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{author.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{author.email}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RoleIcon size={16} className="text-gray-400" />
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                      <StatusIcon size={16} className="text-gray-400" />
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{author.bio}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <BookOpen size={14} />
                        <span>{author.total_articles} articles</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{(author.total_views / 1000).toFixed(1)}K views</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {author.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {specialty}
                        </span>
                      ))}
                      {author.specialties.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{author.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Last active: {formatLastActive(author.last_active)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAuthor(author)}
                            className="p-1 text-[#0A1F44] hover:text-[#1a3a6e] transition"
                            title="Edit Author"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800 transition"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          {author.status === 'active' ? (
                            <button
                              onClick={() => updateAuthorStatus(author.id, 'inactive')}
                              className="p-1 text-red-600 hover:text-red-800 transition"
                              title="Deactivate"
                            >
                              <XCircle size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateAuthorStatus(author.id, 'active')}
                              className="p-1 text-green-600 hover:text-green-800 transition"
                              title="Activate"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAuthors.map((author) => {
                  const roleInfo = getRoleInfo(author.role);
                  const statusInfo = getStatusInfo(author.status);

                  return (
                    <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {author.avatar ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={author.avatar} alt={author.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                              <span>{author.name}</span>
                              {author.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{author.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {author.total_articles}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {author.total_views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatLastActive(author.last_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAuthor(author)}
                            className="text-[#0A1F44] hover:text-[#1a3a6e] p-1"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteAuthor(author.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAuthors.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No authors found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first author.'}
          </p>
          {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A1F44] hover:bg-[#1a3a6e]"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add New Author
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Author Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Author</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Coimbatore, Tamil Nadu"
                    />
                  </div>
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Author['role'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Author['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Short biography..."
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specialties
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.specialties.map(specialty => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0A1F44] text-white"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:text-red-300"
                        >
                          <XCircle size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add a specialty (e.g., Politics, Sports)"
                    />
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="px-4 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a6e] transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Social Links
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      value={formData.social_links.twitter}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        social_links: { ...prev.social_links, twitter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Twitter URL"
                    />
                    <input
                      type="url"
                      value={formData.social_links.linkedin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        social_links: { ...prev.social_links, linkedin: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>

                {/* Verification */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                    className="h-4 w-4 text-[#0A1F44] focus:ring-[#0A1F44] border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Verified Author
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAuthor}
                  className="px-6 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a6e] transition"
                >
                  Create Author
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}