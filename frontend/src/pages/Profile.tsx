import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiSliders, FiKey, FiAlertTriangle, FiSave, FiEye, FiEyeOff, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useAuthStore } from '../services/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

type Tab = 'personal' | 'security' | 'preferences' | 'api' | 'danger';

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'personal', label: 'Personal Info', icon: FiUser },
  { key: 'security', label: 'Security', icon: FiLock },
  { key: 'preferences', label: 'Preferences', icon: FiSliders },
  { key: 'api', label: 'API Access', icon: FiKey },
  { key: 'danger', label: 'Danger Zone', icon: FiAlertTriangle },
];

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const updateField = async (endpoint: string, data: any, successMsg: string) => {
    try {
      const res = await api.put(endpoint, data);
      if (res.data.data) setUser({ ...user!, ...res.data.data });
      toast.success(successMsg);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'personal': return <PersonalInfoTab user={user} onUpdate={(d: any) => updateField('/api/user/profile', d, 'Profile updated')} />;
      case 'security': return <SecurityTab user={user} onUpdate={updateField} />;
      case 'preferences': return <PreferencesTab user={user} onUpdate={(d: any) => updateField('/api/user/preferences', d, 'Preferences saved')} />;
      case 'api': return <ApiAccessTab user={user} />;
      case 'danger': return <DangerZoneTab />;
      default: return null;
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#6C3CE1]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-500 mt-0.5">Manage your account</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? 'bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] text-white shadow-lg shadow-[#6C3CE1]/20'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8"
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTab()}
        </motion.div>
      </div>
    </div>
  );
}

function PersonalInfoTab({ user, onUpdate }: { user: any; onUpdate: (d: any) => Promise<void> }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ username, email, bio }); };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5"><FiUser className="inline mr-1.5" size={14} /> Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
          minLength={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5"><FiLock className="inline mr-1.5" size={14} /> Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all" />
        {!user?.emailVerified && <p className="text-xs text-yellow-400 mt-1">Email not verified</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all resize-none"
          rows={3} maxLength={500} placeholder="Tell us about yourself (max 500 chars)" />
        <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
      </div>
      <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all flex items-center gap-2">
        <FiSave size={16} /> Save Changes
      </button>
    </form>
  );
}

function SecurityTab({ user, onUpdate }: { user: any; onUpdate: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [username, setUsername] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('/api/user/security/password', { currentPassword, newPassword }, 'Password changed');
    setCurrentPassword(''); setNewPassword('');
  };

  const handleUsernameChange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('/api/user/security/username', { username }, 'Username changed');
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
            placeholder="Current password" required />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
            placeholder="New password (8+ chars)" required minLength={8} />
          <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all">
            Change Password
          </button>
        </form>
      </div>
      <hr className="border-white/10" />
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Change Username</h3>
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
            placeholder="New username" required minLength={3} />
          <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all">
            Update Username
          </button>
        </form>
      </div>
    </div>
  );
}

function PreferencesTab({ user, onUpdate }: { user: any; onUpdate: any }) {
  const [prefs, setPrefs] = useState({
    notificationEnabled: user?.notificationEnabled ?? true,
    shortCodeLength: user?.shortCodeLength ?? 6,
    includeUppercase: user?.includeUppercase ?? true,
    includeLowercase: user?.includeLowercase ?? true,
    includeNumbers: user?.includeNumbers ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onUpdate(prefs); };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={prefs.notificationEnabled} onChange={(e) => setPrefs({ ...prefs, notificationEnabled: e.target.checked })}
          className="rounded border-white/20 bg-white/5 text-[#6C3CE1] focus:ring-[#6C3CE1] w-5 h-5" />
        <div>
          <p className="text-sm font-medium text-gray-200">Email Notifications</p>
          <p className="text-xs text-gray-500">Receive email when your links are visited</p>
        </div>
      </label>

      <hr className="border-white/10" />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Short Code Length: {prefs.shortCodeLength}</label>
        <input type="range" min={4} max={12} value={prefs.shortCodeLength} onChange={(e) => setPrefs({ ...prefs, shortCodeLength: parseInt(e.target.value) })}
          className="w-full accent-[#6C3CE1]" />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>4</span><span>12</span></div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-300">Character Set</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={prefs.includeUppercase} onChange={(e) => setPrefs({ ...prefs, includeUppercase: e.target.checked })}
            className="rounded border-white/20 bg-white/5 text-[#6C3CE1] focus:ring-[#6C3CE1]" /> Uppercase (A-Z)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={prefs.includeLowercase} onChange={(e) => setPrefs({ ...prefs, includeLowercase: e.target.checked })}
            className="rounded border-white/20 bg-white/5 text-[#6C3CE1] focus:ring-[#6C3CE1]" /> Lowercase (a-z)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={prefs.includeNumbers} onChange={(e) => setPrefs({ ...prefs, includeNumbers: e.target.checked })}
            className="rounded border-white/20 bg-white/5 text-[#6C3CE1] focus:ring-[#6C3CE1]" /> Numbers (0-9)
        </label>
      </div>

      <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all flex items-center gap-2">
        <FiSave size={16} /> Save Preferences
      </button>
    </form>
  );
}

function ApiAccessTab({ user }: { user: any }) {
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [showKey, setShowKey] = useState(false);

  const revealKey = async () => {
    try {
      const res = await api.get('/api/user/api-key');
      setApiKey(res.data.data.apiKey || '');
      setShowKey(true);
    } catch { toast.error('Failed to load API key'); }
  };

  const regenerateKey = async () => {
    try {
      const res = await api.post('/api/user/api-key/regenerate');
      setApiKey(res.data.data.apiKey);
      setShowKey(true);
      toast.success('API key regenerated');
    } catch { toast.error('Failed to regenerate API key'); }
  };

  const copyKey = () => { navigator.clipboard.writeText(apiKey); toast.success('API key copied'); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">API Key</h3>
        <p className="text-sm text-gray-400 mb-4">Use this key to authenticate with the NexusURL Public API.</p>
        {!showKey && !apiKey ? (
          <button onClick={revealKey} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <FiEye className="inline mr-1.5" size={14} /> Reveal API Key
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <input type="text" value={apiKey} readOnly
              className="flex-1 min-w-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none" />
            <button onClick={copyKey} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5">
              <FiCopy size={14} /> Copy
            </button>
            <button onClick={regenerateKey} className="px-4 py-2.5 rounded-xl text-sm font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all flex items-center gap-1.5">
              <FiRefreshCw size={14} /> Regenerate
            </button>
          </div>
        )}
      </div>
      <hr className="border-white/10" />
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Public API Usage</h3>
        <p className="text-sm text-gray-400 mb-4">Create short links using a simple GET request.</p>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3 font-mono text-sm">
          <p className="text-gray-500"># curl example:</p>
          <p className="text-gray-300">
            curl "<span className="text-[#00D4FF]">https://xus.me/api/public/create?act=ct&amp;l=https://example.com</span>"
          </p>
          <p className="text-gray-500 mt-3"># JavaScript:</p>
          <p className="text-gray-300">
            fetch('<span className="text-[#00D4FF]">https://xus.me/api/public/create?act=ct&amp;l=https://example.com</span>')
          </p>
          <p className="text-gray-500 mt-3"># Parameters:</p>
          <p className="text-gray-400">l=URL (required), ca=custom-alias, pwd=password, exp=expiration, acp=one-time</p>
        </div>
      </div>
    </div>
  );
}

function DangerZoneTab() {
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    if (!password) { toast.error('Password is required'); return; }
    try {
      await api.delete('/api/user/account', { data: { password } });
      toast.success('Account deleted');
      await logout();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
          <FiAlertTriangle size={18} /> Delete Account
        </h3>
        <p className="text-sm text-red-300/80">Permanently delete your account and all associated data. This cannot be undone.</p>
      </div>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
        placeholder="Enter your password" />
      <div>
        <p className="text-sm text-gray-400 mb-2">Type <strong className="text-red-400">DELETE</strong> to confirm:</p>
        <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-red-500/50 transition-all"
          placeholder="Type DELETE" />
      </div>
      <button
        onClick={handleDelete}
        disabled={confirmText !== 'DELETE'}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
      >
        Delete My Account
      </button>
    </div>
  );
}
