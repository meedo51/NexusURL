import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PublicApiPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const res = await api.get('/api/user/api-key');
      if (res.data.data.apiKey) {
        setApiKey(res.data.data.apiKey);
      }
    } catch {}
  };

  const revealKey = async () => {
    if (apiKey) { setShowKey(true); return; }
    try {
      const res = await api.post('/api/user/api-key/regenerate');
      setApiKey(res.data.data.apiKey);
      setShowKey(true);
      toast.success('API key generated');
    } catch {
      toast.error('Failed to generate API key');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
      <p className="text-gray-500">Integrate NexusURL into your applications using our simple Public API.</p>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your API Key</h2>
        {!showKey ? (
          <button onClick={revealKey} className="btn-primary">Reveal API Key</button>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={apiKey} readOnly className="input-field font-mono text-sm flex-1" />
            <button onClick={copyKey} className="btn-secondary text-sm">Copy</button>
            <button onClick={regenerateKey} className="btn-secondary text-sm">Regenerate</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-mono text-primary-600 break-all">GET http://187.77.183.14:1156/api/public/create</p>
        </div>

        <h3 className="font-medium text-gray-900 mb-2">Query Parameters</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Parameter</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Required</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50"><td className="py-2 px-3 font-mono">act</td><td className="py-2 px-3">Yes</td><td className="py-2 px-3">Action, must be "ct" (create)</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3 font-mono">l</td><td className="py-2 px-3">Yes</td><td className="py-2 px-3">Long URL to shorten</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3 font-mono">ca</td><td className="py-2 px-3">No</td><td className="py-2 px-3">Custom alias</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3 font-mono">pwd</td><td className="py-2 px-3">No</td><td className="py-2 px-3">Password protection</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3 font-mono">exp</td><td className="py-2 px-3">No</td><td className="py-2 px-3">Expiration date (ISO 8601)</td></tr>
              <tr><td className="py-2 px-3 font-mono">acp</td><td className="py-2 px-3">No</td><td className="py-2 px-3">One-time access (1 or 0)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">cURL</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
curl "http://187.77.183.14:1156/api/public/create?act=ct&amp;l=https://example.com/very/long/url&amp;ca=my-link&amp;pwd=secret123"
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">JavaScript (Fetch)</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
fetch('http://187.77.183.14:1156/api/public/create?act=ct&amp;l=https://example.com')
  .then(r =&gt; r.json())
  .then(d =&gt; console.log(d));
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Python</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
import requests

params = {
    'act': 'ct',
    'l': 'https://example.com/very/long/url',
    'ca': 'my-link',
}
r = requests.get('http://187.77.183.14:1156/api/public/create', params=params)
print(r.json())
            </pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits</h2>
        <p className="text-sm text-gray-600">The Public API is rate limited to <strong>50 requests per hour</strong> per IP address. If you exceed this limit, you'll receive a 429 response.</p>
      </div>
    </div>
  );
}
