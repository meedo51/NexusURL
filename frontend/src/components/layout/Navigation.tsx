import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../services/authStore';
import { FiHome, FiLink, FiBarChart2, FiUser, FiLogOut, FiMenu, FiX, FiPlus } from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/links', icon: FiLink, label: 'Links' },
  { path: '/links', icon: FiBarChart2, label: 'Analytics', match: '/links/' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Navigation({ onNewLink }: { onNewLink?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (item: typeof navItems[0]) => {
    if (item.match) return location.pathname.startsWith(item.match);
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C3CE1] to-[#FF6B6B] flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-[#6C3CE1]/20">
                N
              </div>
              <span className="hidden sm:block font-semibold text-white">
                Nexus<span className="text-gradient">URL</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] rounded-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onNewLink}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B] hover:shadow-lg hover:shadow-[#6C3CE1]/25 transition-all"
              >
                <FiPlus size={16} />
                <span>New Link</span>
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-white">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <div className="relative group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C3CE1] to-[#FF6B6B] flex items-center justify-center text-xs font-bold text-white cursor-pointer">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#12122A] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm text-white">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <FiUser size={14} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute top-16 left-0 right-0 bg-[#0A0A1A] border-b border-white/5 p-4 space-y-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <hr className="border-white/5 my-2" />
              <button
                onClick={() => { setMobileOpen(false); onNewLink?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#6C3CE1] to-[#FF6B6B]"
              >
                <FiPlus size={18} />
                New Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
