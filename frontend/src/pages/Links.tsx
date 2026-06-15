import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CreateLinkForm from '../components/CreateLinkForm';
import toast from 'react-hot-toast';

export default function Links() {
  const [links, setLinks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadLinks();
  }, [pagination.page, sortBy, order]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/links', {
        params: { page: pagination.page, limit: 20, sortBy, order, search: search || undefined },
      });
      setLinks(res.data.data.links);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPagination(p => ({ ...p, page: 1 })); loadLinks(); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    try {
      await api.delete(`/api/links/${id}`);
      toast.success('Link deleted');
      loadLinks();
    } catch {
      toast.error('Failed to delete link');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const getStatusBadge = (link: any) => {
    if (!link.isActive) return <span className="badge bg-gray-100 text-gray-600">Inactive</span>;
    if (link.expirationDate && new Date(link.expirationDate) < new Date()) return <span className="badge bg-red-100 text-red-700">Expired</span>;
    if (link.expirationDate) {
      const daysLeft = Math.ceil((new Date(link.expirationDate).getTime() - Date.now()) / (1000*60*60*24));
      if (daysLeft < 7) return <span className="badge bg-yellow-100 text-yellow-700">{daysLeft}d left</span>;
    }
    if (link.hasPassword) return <span className="badge bg-purple-100 text-purple-700">Protected</span>;
    if (link.oneTimeAccess) return <span className="badge bg-blue-100 text-blue-700">One-time</span>;
    return <span className="badge bg-green-100 text-green-700">Active</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links</h1>
          <p className="text-gray-500">{pagination.total} total links</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Link
        </button>
      </div>

      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="input-field flex-1" placeholder="Search links by URL or short code..." />
        <button onClick={handleSearch} className="btn-secondary">Search</button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto">
          <option value="created_at">Created</option>
          <option value="clicks">Clicks</option>
        </select>
        <button onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')} className="btn-secondary px-3">
          {order === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No links found</p>
            <p className="text-sm mb-4">Create your first shortened URL</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create Link</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Short URL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Long URL</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Clicks</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary-600 font-medium">{link.shortCode}</span>
                        <button onClick={() => handleCopy(link.shortUrl)} className="text-gray-400 hover:text-gray-600" title="Copy short URL">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={link.longUrl}>{link.longUrl}</td>
                    <td className="py-3 px-4 text-center font-medium">{link.clicks}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(link)}</td>
                    <td className="py-3 px-4 text-center text-gray-500 text-xs">{new Date(link.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/links/${link.id}/stats`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Stats</Link>
                        <button onClick={() => handleDelete(link.id)} className="text-red-500 hover:text-red-600 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="btn-secondary px-3 py-1.5 text-sm">Prev</button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="btn-secondary px-3 py-1.5 text-sm">Next</button>
        </div>
      )}

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
              <CreateLinkForm onSuccess={() => { setShowCreate(false); loadLinks(); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
