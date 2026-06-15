import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  onSuccess?: () => void;
}

export default function CreateLinkForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    longUrl: '',
    customAlias: '',
    password: '',
    expirationDate: '',
    oneTimeAccess: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);
  const [checkingAlias, setCheckingAlias] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    if (field === 'customAlias' && value) {
      checkAlias(value as string);
    }
  };

  const checkAlias = async (alias: string) => {
    if (alias.length < 3) { setAliasAvailable(null); return; }
    setCheckingAlias(true);
    try {
      const res = await api.get(`/api/links/check-alias/${alias}`);
      setAliasAvailable(res.data.data.available);
    } catch { setAliasAvailable(null); }
    finally { setCheckingAlias(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.longUrl) { toast.error('Long URL is required'); return; }
    setLoading(true);
    try {
      const payload: any = { longUrl: form.longUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.password) payload.password = form.password;
      if (form.expirationDate) payload.expirationDate = new Date(form.expirationDate).toISOString();
      payload.oneTimeAccess = form.oneTimeAccess;

      const res = await api.post('/api/links', payload);
      setResult(res.data.data);
      toast.success('Link created successfully!');
      setForm({ longUrl: '', customAlias: '', password: '', expirationDate: '', oneTimeAccess: false });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium mb-2">Link created!</p>
          <div className="flex items-center gap-2">
            <input type="text" value={result.shortUrl} readOnly className="input-field text-sm flex-1" />
            <button onClick={() => copyToClipboard(result.shortUrl)} className="btn-secondary text-sm px-3 py-2">Copy</button>
          </div>
        </div>
        <button onClick={() => setResult(null)} className="btn-primary w-full">Create another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Long URL *</label>
        <input type="url" value={form.longUrl} onChange={updateField('longUrl')} className="input-field" placeholder="https://example.com/very/long/url" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Alias (optional)</label>
        <div className="relative">
          <input type="text" value={form.customAlias} onChange={updateField('customAlias')} className="input-field pr-10" placeholder="my-custom-alias" maxLength={50} />
          {checkingAlias && <span className="absolute right-3 top-3 text-sm text-gray-400">...</span>}
          {aliasAvailable === true && <span className="absolute right-3 top-3 text-sm text-green-500">✓</span>}
          {aliasAvailable === false && <span className="absolute right-3 top-3 text-sm text-red-500">✗</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
          <input type="text" value={form.password} onChange={updateField('password')} className="input-field" placeholder="Protect with password" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires (optional)</label>
          <input type="date" value={form.expirationDate} onChange={updateField('expirationDate')} className="input-field" min={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.oneTimeAccess} onChange={updateField('oneTimeAccess')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        One-time access (link deactivates after first visit)
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? 'Creating...' : 'Create Short Link'}
      </button>
    </form>
  );
}
