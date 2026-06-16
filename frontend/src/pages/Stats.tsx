import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMousePointer, FiUsers, FiMonitor, FiGlobe, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6C3CE1', '#FF6B6B', '#00D4FF', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'];

const tooltipStyle = { contentStyle: { background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }, labelStyle: { color: '#aaa' } };

function StatCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: number | string; delay: number }) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3CE1]/20 to-[#FF6B6B]/20 border border-white/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="text-[#6C3CE1]" size={18} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

function ChartCard({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, [id]);

  const loadStats = async () => {
    try {
      const res = await api.get(`/api/links/${id}/stats`);
      setStats(res.data.data);
    } catch { toast.error('Failed to load statistics'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-[#6C3CE1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Statistics not available</p>
        <Link to="/links" className="text-[#00D4FF] hover:text-white transition-colors">Back to Links</Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 right-0 w-80 h-80 bg-[#6C3CE1]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D4FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <div>
          <Link to="/links" className="inline-flex items-center gap-1.5 text-sm text-[#00D4FF] hover:text-white transition-colors mb-2">
            <FiArrowLeft size={14} /> Back to Links
          </Link>
          <h1 className="text-2xl font-bold text-white">Link Statistics</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiMousePointer} label="Total Clicks" value={stats.totalClicks} delay={0.05} />
          <StatCard icon={FiUsers} label="Unique Visitors" value={stats.uniqueVisitors} delay={0.1} />
          <StatCard icon={FiMonitor} label="Device Types" value={stats.devices?.length || 0} delay={0.15} />
          <StatCard icon={FiGlobe} label="Countries" value={stats.countries?.length || 0} delay={0.2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Clicks Over Time" delay={0.25}>
            {stats.clicksByDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.clicksByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#6C3CE1" strokeWidth={2} dot={{ r: 4, fill: '#6C3CE1' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No click data yet</p>
            )}
          </ChartCard>

          <ChartCard title="Devices" delay={0.3}>
            {stats.devices?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.devices} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                    {stats.devices.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend formatter={(value) => <span style={{ color: '#aaa' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No device data yet</p>
            )}
          </ChartCard>

          <ChartCard title="Top Referrers" delay={0.35}>
            {stats.topReferrers?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topReferrers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis type="category" dataKey="referer" width={180} tick={{ fontSize: 11, fill: '#aaa' }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#6C3CE1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No referrer data yet</p>
            )}
          </ChartCard>

          <ChartCard title="Browsers" delay={0.4}>
            {stats.browsers?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.browsers} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.browsers.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend formatter={(value) => <span style={{ color: '#aaa' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No browser data yet</p>
            )}
          </ChartCard>
        </div>

        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <FiGlobe size={16} /> Countries
          </h2>
          {stats.countries?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.countries.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-gray-300 text-sm">{c.country || 'Unknown'}</span>
                  <span className="font-medium text-white">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No geographic data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
