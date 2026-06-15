import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16'];

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [id]);

  const loadStats = async () => {
    try {
      const res = await api.get(`/api/links/${id}/stats`);
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load statistics');
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

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Statistics not available</p>
        <Link to="/links" className="text-primary-600 hover:text-primary-700">Back to Links</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Link Statistics</h1>
          <Link to="/links" className="text-sm text-primary-600 hover:text-primary-700">← Back to Links</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.totalClicks}</p>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors}</p>
          <p className="text-sm text-gray-500">Unique Visitors</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.devices?.length || 0}</p>
          <p className="text-sm text-gray-500">Device Types</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.countries?.length || 0}</p>
          <p className="text-sm text-gray-500">Countries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clicks Over Time</h2>
          {stats.clicksByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.clicksByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No click data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
          {stats.devices?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.devices} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.devices.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No device data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h2>
          {stats.topReferrers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topReferrers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="referer" width={200} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No referrer data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browsers</h2>
          {stats.browsers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.browsers} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.browsers.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No browser data yet</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Countries</h2>
        {stats.countries?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.countries.map((c: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                <span className="text-gray-700">{c.country || 'Unknown'}</span>
                <span className="font-medium text-gray-900">{c.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No geographic data yet</p>
        )}
      </div>
    </div>
  );
}
