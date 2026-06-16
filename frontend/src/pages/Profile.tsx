import { useState } from 'react';
import { useAuthStore } from '../services/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

type Tab = 'personal' | 'security' | 'preferences' | 'api' | 'danger';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'security', label: 'Security' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'api', label: 'API Access' },
    { key: 'danger', label: 'Danger Zone' },
  ];

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
      case 'personal':
        return <PersonalInfoTab user={user} onUpdate={(d: any) => updateField('/api/user/profile', d, 'Profile updated')} />;
      case 'security':
        return <SecurityTab user={user} onUpdate={updateField} />;
      case 'preferences':
        return <PreferencesTab user={user} onUpdate={(d: any) => updateField('/api/user/preferences', d, 'Preferences saved')} />;
      case 'api':
        return <ApiAccessTab user={user} />;
      case 'danger':
        return <DangerZoneTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">{renderTab()}</div>
    </div>
  );
}

function PersonalInfoTab({ user, onUpdate }: { user: any; onUpdate: (d: any) => Promise<void> }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ username, email, bio });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" minLength={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        {!user?.emailVerified && <p className="text-xs text-yellow-600 mt-1">Email not verified</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" rows={3} maxLength={500} placeholder="Tell us about yourself (max 500 chars)" />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
      </div>
      <button type="submit" className="btn-primary">Save Changes</button>
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
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleUsernameChange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('/api/user/security/username', { username }, 'Username changed');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" placeholder="Current password" required />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="New password (8+ chars, uppercase, lowercase, number, special)" required minLength={8} />
          <button type="submit" className="btn-primary">Change Password</button>
        </form>
      </div>
      <hr className="border-gray-100" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Username</h3>
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="New username" required minLength={3} />
          <button type="submit" className="btn-primary">Update Username</button>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(prefs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={prefs.notificationEnabled} onChange={(e) => setPrefs({ ...prefs, notificationEnabled: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5" />
        <div>
          <p className="text-sm font-medium text-gray-700">Email Notifications</p>
          <p className="text-xs text-gray-500">Receive email when your links are visited</p>
        </div>
      </label>

      <hr className="border-gray-100" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Code Length: {prefs.shortCodeLength}</label>
        <input type="range" min={4} max={12} value={prefs.shortCodeLength} onChange={(e) => setPrefs({ ...prefs, shortCodeLength: parseInt(e.target.value) })} className="w-full accent-primary-500" />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>4</span><span>12</span></div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Character Set</p>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={prefs.includeUppercase} onChange={(e) => setPrefs({ ...prefs, includeUppercase: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> Uppercase (A-Z)</label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={prefs.includeLowercase} onChange={(e) => setPrefs({ ...prefs, includeLowercase: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> Lowercase (a-z)</label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={prefs.includeNumbers} onChange={(e) => setPrefs({ ...prefs, includeNumbers: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> Numbers (0-9)</label>
      </div>

      <button type="submit" className="btn-primary">Save Preferences</button>
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
    } catch {
      toast.error('Failed to load API key');
    }
  };

  const regenerateKey = async () => {
    if (!confirm('Regenerate API key? Old key will stop working.')) return;
    try {
      const res = await api.post('/api/user/api-key/regenerate');
      setApiKey(res.data.data.apiKey);
      setShowKey(true);
      toast.success('API key regenerated');
    } catch {
      toast.error('Failed to regenerate API key');
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">API Key</h3>
        <p className="text-sm text-gray-500 mb-4">Use this key to authenticate with the NexusURL Public API.</p>
        {!showKey && !apiKey ? (
          <button onClick={revealKey} className="btn-secondary">Reveal API Key</button>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={apiKey} readOnly className="input-field font-mono text-sm flex-1" />
            <button onClick={copyKey} className="btn-secondary text-sm">Copy</button>
            <button onClick={regenerateKey} className="btn-secondary text-sm">Regenerate</button>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Public API Usage</h3>
        <p className="text-sm text-gray-500 mb-4">Create short links using a simple GET request.</p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
          <p className="text-gray-500"># curl example:</p>
          <p className="text-gray-800">curl "<span className="text-primary-600">http://187.77.183.14:1156/api/public/create?act=ct&amp;l=https://example.com</span>"</p>
          <p className="text-gray-500 mt-2"># JavaScript:</p>
          <p className="text-gray-800">fetch('<span className="text-primary-600">http://187.77.183.14:1156/api/public/create?act=ct&amp;l=https://example.com</span>')</p>
          <p className="text-gray-500 mt-2"># Parameters:</p>
          <p className="text-gray-600">l=URL (required), ca=custom-alias, pwd=password, exp=expiration, acp=one-time</p>
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
    if (!confirm('This action cannot be undone. Continue?')) return;

    try {
      await api.delete('/api/user/account', { data: { password } });
      toast.success('Account deleted');
      await logout();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
        <p className="text-sm text-red-600 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
      </div>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" />
      <div>
        <p className="text-sm text-gray-500 mb-2">Type <strong>DELETE</strong> to confirm:</p>
        <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="input-field" placeholder="Type DELETE" />
      </div>
      <button onClick={handleDelete} className="btn-danger" disabled={confirmText !== 'DELETE'}>Delete My Account</button>
    </div>
  );
}
