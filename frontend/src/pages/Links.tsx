import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiExternalLink, FiTrash2, FiBarChart2, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import api from '../services/api';
import CreateLinkForm from '../components/CreateLinkForm';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  protected: { label: 'Protected', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  onetime: { label: 'One-time', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  dying: { label: 'Expiring', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
};

function getStatus(link: any) {
  if (!link.isActive) return statusConfig.inactive;
  if (link.expirationDate && new Date(link.expirationDate) < new Date()) return statusConfig.expired;
  if (link.expirationDate) {
    const daysLeft = Math.ceil((new Date(link.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 7) return { ...statusConfig.dying, label: `${daysLeft}d left` };
  }
  if (link.hasPassword) return statusConfig.protected;
  if (link.oneTimeAccess) return statusConfig.onetime;
  return statusConfig.active;
}

function LinkRow({ link, index, onDelete }: { link: any; index: number; onDelete: (id: string) => void }) {
  return (
    <motion.tr
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#00D4FF] text-sm">{link.shortCode}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(link.shortUrl); toast.success('Copied!'); }}
            className="text-gray-500 hover:text-white transition-colors"
            title="Copy short URL"
          >
            <FiExternalLink size={14} />
          </button>
        </div>
      </td>
      <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate text-sm" title={link.longUrl}>{link.longUrl}</td>
      <td className="py-3.5 px-4 text-center font-medium text-white">{link.clicks}</td>
      <td className="py-3.5 px-4 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatus(link).color}`}>
          {getStatus(link).label}
        </span>
      </td>
      <td className="py-3.5 px-4 text-center text-gray-500 text-xs">{new Date(link.createdAt).toLocaleDateString()}</td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/links/${link.id}/stats`}
            className="p-2 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-white/5 transition-all"
            title="Stats"
          >
            <FiBarChart2 size={15} />
          </Link>
          <button
            onClick={() => onDelete(link.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function Links() {
  const [links, setLinks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadLinks(); }, [pagination.page, sortBy, order]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/links', {
        params: { page: pagination.page, limit: 20, sortBy, order, search: search || undefined },
      });
      setLinks(res.data.data.links);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load links'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPagination((p) => ({ ...p, page: 1 })); loadLinks(); };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/links/${id}`);
      toast.success('Link deleted');
      loadLinks();
    } catch { toast.error('Failed to delete link'); }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#6C3CE1]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#00D4FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Links</h1>
            <p className="text-gray-500 mt-0.5">{pagination.total} total links</p>
          </div>
          <motion.button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={18} /> New Link
          </motion.button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 transition-all text-sm"
              placeholder="Search links by URL or short code..."
            />
          </div>
          <button onClick={handleSearch} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all">
            Search
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-[#6C3CE1]/50 transition-all"
          >
            <option value="created_at" className="bg-[#0A0A1A]">Created</option>
            <option value="clicks" className="bg-[#0A0A1A]">Clicks</option>
          </select>
          <button
            onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            {order === 'desc' ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
          </button>
        </div>

        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-[#6C3CE1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FiSearch size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg mb-1">No links found</p>
              <p className="text-sm text-gray-600 mb-4">{search ? 'Try a different search' : 'Create your first shortened URL'}</p>
              {!search && (
                <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B]">
                  Create Link
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Short URL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Long URL</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Clicks</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link, i) => (
                    <LinkRow key={link.id} link={link} index={i} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <motion.div
            className="bg-[#0A0A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create Short Link</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <CreateLinkForm onSuccess={() => { setShowCreate(false); loadLinks(); }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
