import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1A] px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-md shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">!</div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h1>
          <p className="text-gray-500 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-[#00D4FF] hover:text-white transition-colors font-medium">
            Request a new reset link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A1A] px-4">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-[#6C3CE1]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#00D4FF] text-white font-bold text-xl mb-4 shadow-lg shadow-[#6C3CE1]/20">N</div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-500 mt-1">Choose a strong password</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
              <h2 className="text-lg font-semibold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-6">Your password has been successfully reset.</p>
              <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B]">
                Sign In →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <FiLock className="inline mr-1.5" size={14} /> New Password
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                  placeholder="Min 8 characters" required minLength={8} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <FiLock className="inline mr-1.5" size={14} /> Confirm Password
                </label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                  placeholder="Repeat password" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#00D4FF] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <div className="text-center">
                <Link to="/signin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
                  <FiArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
