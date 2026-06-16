import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../services/authStore';

export default function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-dark/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-brand-purple/5'
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-brand-purple/20 group-hover:shadow-brand-purple/40 transition-shadow duration-300">
              N
            </div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">
              Nexus<span className="text-gradient">URL</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              How It Works
            </a>
            <a href="#stats" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Stats
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white btn-gradient shadow-lg shadow-brand-purple/25"
                >
                  Sign Up Free
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">How It Works</a>
            <a href="#stats" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Stats</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Pricing</a>
          </div>
        </div>
      )}
    </nav>
  );
}
