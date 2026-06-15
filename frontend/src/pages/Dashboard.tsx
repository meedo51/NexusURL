import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../services/authStore';
import CreateLinkForm from '../components/CreateLinkForm';
import toast from 'react-hot-toast';

interface QuickStats {
  totalLinks: number;
  totalClicks: number;
  recentLinks: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<QuickStats>({ totalLinks: 0, totalClicks: 0, recentLinks: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [linksRes] = await Promise.all([
        api.get('/api/links', { params: { limit: 5, sortBy: 'created_at', order: 'desc' } }),
      ]);
      const links = linksRes.data.data.links || [];
      const totalClicks = links.reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);
      setStats({ totalLinks: linksRes.data.data.pagination.total, totalClicks, recentLinks: links });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.username}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Links</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLinks}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Clicks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalClicks}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg CTR</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Links</h2>
          <Link to="/links" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
        </div>
        {stats.recentLinks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No links yet</p>
            <p className="text-sm">Create your first shortened URL to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Short URL</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Long URL</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLinks.map((link: any) => (
                  <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <a href={link.shortUrl} target="_blank" className="text-primary-600 hover:text-primary-700 font-medium">{link.shortCode}</a>
                    </td>
                    <td className="py-3 px-2 text-gray-600 max-w-xs truncate">{link.longUrl}</td>
                    <td className="py-3 px-2 text-right font-medium">{link.clicks}</td>
                    <td className="py-3 px-2 text-right text-gray-500">{new Date(link.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Short Link</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <CreateLinkForm onSuccess={() => { setShowCreate(false); loadData(); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
