import { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCopy, FiExternalLink, FiDownload } from 'react-icons/fi';

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

  const handleDownloadQR = async () => {
    if (!result) return;
    try {
      const response = await api.get(`/api/qr/${result.shortCode}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexusurl-${result.shortCode}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <p className="text-green-400 font-medium mb-3 flex items-center gap-2">
            Link created successfully!
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={result.shortUrl}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
            />
            <button
              onClick={() => copyToClipboard(result.shortUrl)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Copy link"
            >
              <FiCopy size={16} />
            </button>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Open link"
            >
              <FiExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 bg-white/[0.02] rounded-xl border border-white/5 p-4">
          <div className="relative">
            <div className="bg-[#0A0A1A] p-3 rounded-xl border border-[#6C3CE1]/20">
              <QRCode
                value={result.shortUrl}
                size={160}
                bgColor="#0A0A1A"
                fgColor="#6C3CE1"
                level="H"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#0A0A1A]/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[#6C3CE1]/20">
                <span className="text-[10px] text-[#6C3CE1] font-semibold">NexusURL</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#6C3CE1] bg-[#6C3CE1]/10 border border-[#6C3CE1]/20 hover:bg-[#6C3CE1]/20 transition-all"
          >
            <FiDownload size={14} /> Download QR Code
          </button>
        </div>

        <button
          onClick={() => setResult(null)}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          Create another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Long URL *</label>
        <input
          type="url"
          value={form.longUrl}
          onChange={updateField('longUrl')}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
          placeholder="https://example.com/very/long/url"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Custom Alias (optional)</label>
        <div className="relative">
          <input
            type="text"
            value={form.customAlias}
            onChange={updateField('customAlias')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all pr-10"
            placeholder="my-custom-alias"
            maxLength={50}
          />
          {checkingAlias && <span className="absolute right-3 top-3 text-sm text-gray-400">...</span>}
          {aliasAvailable === true && <span className="absolute right-3 top-3 text-sm text-green-500">✓</span>}
          {aliasAvailable === false && <span className="absolute right-3 top-3 text-sm text-red-500">✗</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Password (optional)</label>
          <input
            type="text"
            value={form.password}
            onChange={updateField('password')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all"
            placeholder="Protect with password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Expires (optional)</label>
          <input
            type="date"
            value={form.expirationDate}
            onChange={updateField('expirationDate')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#6C3CE1]/50 transition-all"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={form.oneTimeAccess}
          onChange={updateField('oneTimeAccess')}
          className="rounded border-gray-600 bg-white/5 text-[#6C3CE1] focus:ring-[#6C3CE1]/30"
        />
        One-time access (link deactivates after first visit)
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all disabled:opacity-60"
      >
        {loading ? 'Creating...' : 'Create Short Link'}
      </button>
    </form>
  );
}
