import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface ShortenResult {
  short_url: string;
  short_code: string;
  long_url: string;
  qr_code_url: string;
}

export default function HomepageShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [password, setPassword] = useState('');
  const [expiration, setExpiration] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(5);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      api.get('/api/public/free-limit').then((r) => {
        setRemaining(r.data.remaining ?? 5);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      if (!isAuthenticated) {
        const limitRes = await api.get('/api/public/free-limit');
        if (limitRes.data.remaining <= 0) {
          setError('Free limit reached! Sign up for unlimited access.');
          setLoading(false);
          return;
        }
        setRemaining(limitRes.data.remaining);
      }

      const params: Record<string, string> = { l: longUrl };
      if (customAlias) params.ca = customAlias;
      if (password) params.pwd = password;
      if (expiration) params.exp = expiration;

      const res = await api.get('/api/public/create', { params });
      setResult(res.data.data);
      setLongUrl('');
      setCustomAlias('');
      setPassword('');
      setExpiration('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [longUrl, customAlias, password, expiration, isAuthenticated]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [result]);

  const handleReset = useCallback(() => {
    setResult(null);
    setCopied(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple via-primary-500 to-brand-coral rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand-purple/50 focus-within:shadow-lg focus-within:shadow-brand-purple/10 transition-all duration-300">
              <input
                type="url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                required
                className="flex-1 bg-transparent px-6 py-4 lg:py-5 text-base lg:text-lg text-white placeholder-gray-500 outline-none min-w-0"
                aria-label="Enter your long URL"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 lg:px-8 py-4 lg:py-5 bg-gradient-to-r from-brand-purple to-brand-coral hover:from-brand-purple/90 hover:to-brand-coral/90 text-white font-semibold text-sm lg:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <span>Shorten</span>
                )}
                {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center" role="alert">{error}</p>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              More options
            </button>
          </div>

          {showOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-up">
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg shrink-0">🔗</span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.replace(/[^A-Za-z0-9\-_]/g, ''))}
                  placeholder="Custom alias"
                  maxLength={50}
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
                  aria-label="Custom alias"
                />
              </div>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg shrink-0">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password protect"
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
                  aria-label="Password protect"
                />
              </div>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg shrink-0">📅</span>
                <input
                  type="date"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full [color-scheme:dark]"
                  aria-label="Expiration date"
                />
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">
                🎁 <strong className="text-white">{remaining}</strong> free links remaining this week
              </span>
              <span className="text-gray-600">•</span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-brand-cyan hover:text-white transition-colors font-medium"
              >
                Sign up for unlimited →
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="glass rounded-2xl p-6 lg:p-8 border border-white/10 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Your short link is ready!</h3>
              <p className="text-gray-500 text-sm">Share it anywhere, track every click.</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Destination</p>
            <p className="text-sm text-gray-400 truncate">{result.long_url}</p>
          </div>

          <div className="flex items-center gap-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl px-4 py-3 mb-4">
            <a
              href={result.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-brand-cyan font-medium text-sm lg:text-base truncate hover:underline"
            >
              {result.short_url}
            </a>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={result.qr_code_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all"
              >
                QR
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            >
              Shorten another
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white btn-gradient"
              >
                View Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/signup')}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white btn-gradient"
              >
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
