import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiLink, FiMousePointer, FiTrendingUp, FiExternalLink, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import { useAuthStore } from '../services/authStore';
import CreateLinkForm from '../components/CreateLinkForm';
import toast from 'react-hot-toast';

interface QuickStats {
  totalLinks: number;
  totalClicks: number;
  recentLinks: any[];
}

function StatCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: number | string; delay: number }) {
  const [display, setDisplay] = useState(0);
  const target = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, duration / 60);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3CE1]/20 to-[#FF6B6B]/20 border border-white/10 flex items-center justify-center">
          <Icon className="text-[#6C3CE1]" size={18} />
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{display}</p>
    </motion.div>
  );
}

function RecentLinkRow({ link, index }: { link: any; index: number }) {
  return (
    <motion.tr
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#00D4FF]">{link.shortCode}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(link.shortUrl); toast.success('Copied!'); }}
            className="text-gray-500 hover:text-white transition-colors"
            title="Copy"
          >
            <FiExternalLink size={14} />
          </button>
        </div>
      </td>
      <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate text-sm">{link.longUrl}</td>
      <td className="py-3.5 px-4 text-center">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
          <FiMousePointer size={14} className="text-[#FF6B6B]" /> {link.clicks}
        </span>
      </td>
      <td className="py-3.5 px-4 text-right text-gray-500 text-xs">
        <FiCalendar className="inline mr-1" size={12} />
        {new Date(link.createdAt).toLocaleDateString()}
      </td>
    </motion.tr>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<QuickStats>({ totalLinks: 0, totalClicks: 0, recentLinks: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [linksRes] = await Promise.all([
        api.get('/api/links', { params: { limit: 5, sortBy: 'created_at', order: 'desc' } }),
      ]);
      const links = linksRes.data.data.links || [];
      const totalClicks = links.reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);
      setStats({ totalLinks: linksRes.data.data.pagination.total, totalClicks, recentLinks: links });
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-[#6C3CE1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C3CE1]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-500 mt-0.5">Welcome back, {user?.username}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={FiLink} label="Total Links" value={stats.totalLinks} delay={0.1} />
          <StatCard icon={FiMousePointer} label="Total Clicks" value={stats.totalClicks} delay={0.2} />
          <StatCard icon={FiTrendingUp} label="Avg CTR" value={stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0} delay={0.3} />
        </div>

        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-white">Recent Links</h2>
            <Link to="/links" className="text-sm text-[#00D4FF] hover:text-white transition-colors font-medium">
              View all →
            </Link>
          </div>
          {stats.recentLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiLink size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg mb-1">No links yet</p>
              <p className="text-sm text-gray-600 mb-4">Create your first shortened URL to get started</p>
              <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B]">
                Create Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Short URL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Long URL</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Clicks</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLinks.map((link: any, i: number) => (
                    <RecentLinkRow key={link.id} link={link} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
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
              <CreateLinkForm onSuccess={() => { setShowCreate(false); loadData(); }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
