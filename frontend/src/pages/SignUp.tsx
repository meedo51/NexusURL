import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../services/authStore';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
  const width = (strength / 6) * 100;

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[i - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs mt-1 ${strength <= 2 ? 'text-red-400' : strength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
          {labels[Math.min(strength, 5) - 1] || 'Weak'}
        </p>
      )}
    </div>
  );
}

export default function SignUp() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A1A] px-4">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#6C3CE1]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#FF6B6B] text-white font-bold text-xl mb-4 shadow-lg shadow-[#6C3CE1]/20">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-500 mt-1">Join thousands of happy users</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FiUser className="inline mr-1.5" size={14} /> Username
              </label>
              <input
                type="text" value={form.username} onChange={updateField('username')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                placeholder="johndoe" required minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FiMail className="inline mr-1.5" size={14} /> Email
              </label>
              <input
                type="email" value={form.email} onChange={updateField('email')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                placeholder="you@example.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FiLock className="inline mr-1.5" size={14} /> Password
              </label>
              <input
                type="password" value={form.password} onChange={updateField('password')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                placeholder="Min 8 characters" required minLength={8}
              />
              <PasswordStrength password={form.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FiLock className="inline mr-1.5" size={14} /> Confirm Password
              </label>
              <input
                type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#6C3CE1]/50 focus:shadow-[0_0_20px_rgba(108,60,225,0.1)] transition-all"
                placeholder="Repeat your password" required
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Create Account <FiArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/signin" className="text-[#00D4FF] hover:text-white transition-colors font-medium">
              Sign In →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
