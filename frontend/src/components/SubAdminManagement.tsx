import { useState, useEffect } from 'react';
import { UserCheck, Shield, Trash2, UserPlus, X, Check, Edit } from 'lucide-react';
import { API_BASE_URL } from '../config';

export interface SubAdmin {
  id: string;
  name: string;
  specialName: string;
  email: string;
  password?: string;
  role: 'SUB_ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

const STORAGE_KEY_ADMINS = 'cbe_sub_admins';

export const getStoredSubAdmins = (): SubAdmin[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading sub admins:', err);
  }
  return [];
};

export const saveSubAdminToStorage = (admin: SubAdmin) => {
  const admins = getStoredSubAdmins();
  const existingIndex = admins.findIndex(a => a.id === admin.id || a.email === admin.email);
  if (existingIndex >= 0) {
    admins[existingIndex] = admin;
  } else {
    admins.push(admin);
  }
  localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
};

export const deleteSubAdminFromStorage = (id: string) => {
  const admins = getStoredSubAdmins().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
};

export default function SubAdminManagement() {
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      // Try backend first
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.users) {
          const apiAdmins: SubAdmin[] = result.data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            specialName: u.bio || u.name,
            email: u.email,
            role: u.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'SUB_ADMIN',
            createdAt: u.createdAt
          }));
          setAdmins(apiAdmins);
          return;
        }
      }
    } catch {
      // Backend unavailable, fallback to local storage
    }

    // Fallback to local storage
    const localAdmins = getStoredSubAdmins();
    setAdmins(localAdmins);
  };

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      specialName: '',
      email: '',
      password: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (admin: SubAdmin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      specialName: admin.specialName,
      email: admin.email,
      password: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete admin "${email}"?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        setSuccess('Sub-Admin deleted successfully');
      }
    } catch {
      // Ignore API errors for offline mode
    }

    deleteSubAdminFromStorage(id);
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.specialName.trim()) {
      setError('Please fill in all required fields (Name, Special Name, Email).');
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      setError('Password is required for new Sub-Admins.');
      return;
    }

    const newAdmin: SubAdmin = {
      id: editingAdmin ? editingAdmin.id : 'admin_' + Date.now(),
      name: formData.name.trim(),
      specialName: formData.specialName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password || (editingAdmin ? editingAdmin.password : ''),
      role: 'SUB_ADMIN',
      createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString()
    };

    // Save to API if available
    try {
      if (!editingAdmin) {
        await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newAdmin.email,
            password: newAdmin.password,
            name: newAdmin.name,
            role: 'SUB_ADMIN',
            bio: newAdmin.specialName
          })
        });
      }
    } catch {
      // Ignore API errors in fallback mode
    }

    saveSubAdminToStorage(newAdmin);
    setSuccess(editingAdmin ? 'Sub-Admin updated successfully!' : 'Sub-Admin created successfully!');
    setShowModal(false);
    loadAdmins();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="text-[#D90429]" size={32} />
            Sub-Admin Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Super Admin can create unlimited sub-admins and assign special display names for news posting.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-[#0A1F44] text-white px-5 py-2.5 rounded-xl hover:bg-[#1a3a6e] transition flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <UserPlus size={20} />
          <span className="font-semibold">Create New Sub-Admin</span>
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center gap-2">
          <Check size={20} className="text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  admin.role === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub Admin'}
                </span>
                <span className="text-xs text-gray-400">
                  Created {new Date(admin.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {admin.name}
              </h3>
              
              <div className="inline-block bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[#D90429] dark:text-red-400 text-xs font-semibold px-2.5 py-1 rounded-lg mb-3">
                Alias: {admin.specialName}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-400">Email:</span> {admin.email}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => handleEdit(admin)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-semibold flex items-center gap-1"
              >
                <Edit size={16} /> Edit
              </button>
              {admin.role !== 'SUPER_ADMIN' && (
                <button
                  onClick={() => handleDelete(admin.id, admin.email)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-semibold flex items-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {admins.length === 0 && (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Sub-Admins Created Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Click the button above to create your first sub-admin with special display names.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="text-[#0A1F44] dark:text-blue-400" size={24} />
                {editingAdmin ? 'Edit Sub-Admin' : 'Create New Sub-Admin'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0A1F44] outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Special Admin Name / Alias (Visible to Super Admin) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief News Correspondent / Kovai Reporter 1"
                  value={formData.specialName}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0A1F44] outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@coimbatoreexpress.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0A1F44] outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password {editingAdmin ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0A1F44] outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A1F44] text-white rounded-xl hover:bg-[#1a3a6e] font-semibold"
                >
                  {editingAdmin ? 'Save Changes' : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
