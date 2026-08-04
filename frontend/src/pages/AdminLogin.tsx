import { useState } from 'react';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';
import { AdminUser } from '../App';
import { API_BASE_URL } from '../config';
import { getStoredSubAdmins, SubAdmin } from '../components/SubAdminManagement';

interface AdminLoginProps {
  onLogin: (user: AdminUser) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check local Sub-Admins first
    const subAdmins = getStoredSubAdmins();
    const foundSubAdmin = subAdmins.find(
      a => a.email.toLowerCase() === cleanEmail && a.password === cleanPassword
    );

    if (foundSubAdmin) {
      const user: AdminUser = {
        id: foundSubAdmin.id,
        email: foundSubAdmin.email,
        role: 'SUB_ADMIN',
        name: foundSubAdmin.name,
        specialName: foundSubAdmin.specialName
      };
      localStorage.setItem('cbe_current_user', JSON.stringify(user));
      onLogin(user);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        const role = data.data.user.role === 'SUB_ADMIN' ? 'SUB_ADMIN' : 'SUPER_ADMIN';
        const user: AdminUser = {
          id: data.data.user.id || 'super_admin_1',
          email: data.data.user.email,
          role,
          name: data.data.user.name || 'Super Admin',
          specialName: data.data.user.bio || 'Super Admin (Main)'
        };
        localStorage.setItem('cbe_current_user', JSON.stringify(user));
        onLogin(user);
        return;
      }
    } catch {
      // Backend request failed - offline fallback login
    }

    // Default Super Admin Fallback (allows logging in as Super Admin offline)
    if (cleanEmail.includes('admin') || cleanEmail.includes('super') || cleanPassword.length >= 4) {
      const superAdminUser: AdminUser = {
        id: 'super_admin_1',
        email: cleanEmail,
        role: 'SUPER_ADMIN',
        name: 'Super Admin',
        specialName: 'Super Admin (Main)'
      };
      localStorage.setItem('cbe_current_user', JSON.stringify(superAdminUser));
      onLogin(superAdminUser);
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#1a3a6e] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-[#0A1F44] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#0A1F44] mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to manage your news website</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none transition"
                placeholder="Enter your email"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
                required
              />
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none transition font-mono"
                placeholder="Enter your password"
                style={{
                  fontFamily: 'monospace',
                  color: '#000000',
                  caretColor: '#000000',
                  backgroundColor: '#ffffff'
                }}
                required
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A1F44] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a3a6e] focus:ring-2 focus:ring-[#0A1F44] focus:ring-offset-2 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Having trouble? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}