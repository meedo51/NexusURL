import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../services/authStore';
import HomepageShortener from './HomepageShortener';

const stats = [
  { label: 'Links Shortened', value: '2.4M+', icon: '🔗' },
  { label: 'Uptime', value: '99.9%', icon: '⚡' },
  { label: 'User Rating', value: '4.8⭐', icon: '⭐' },
  { label: 'Countries', value: '147', icon: '🌍' },
];

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const num = parseInt(target.replace(/[^0-9.]/g, ''));

  useEffect(() => {
    if (isNaN(num)) { setDisplay(target); return; }

    const isFloat = target.includes('.');
    const steps = 60;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const current = (num * progress);
      setDisplay(isFloat ? current.toFixed(1) : Math.floor(current).toString());
      if (step >= steps) {
        setDisplay(target);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [target, num]);

  return <>{display}{suffix}</>;
}

export default function HeroSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [globeActive, setGlobeActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGlobeActive(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-purple/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-coral/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '4s' }} />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-brand-purple/[0.05] rounded-full animate-spin-slow" />

        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-brand-cyan/30 rounded-full animate-drift"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${15 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-gray-400 mb-8 animate-fade-in border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Trusted by 15K+ users worldwide
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
          <span className="text-white">Where Links</span>
          <br />
          <span className="text-gradient">Connect to Possibility</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up-delayed leading-relaxed">
          NexusURL transforms your long URLs into sleek, trackable links.
          Shorten, customize, and analyze every click with real-time precision.
        </p>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <HomepageShortener />
        </div>

        <div className="mt-12 lg:mt-16 animate-slide-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <div className="glass rounded-2xl border border-white/5 p-6 lg:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-display text-2xl lg:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-xs lg:text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <p className="text-sm text-gray-500">
              ⚡ 5 free links every week • No credit card required •{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-brand-cyan hover:text-white transition-colors font-medium"
              >
                Sign up for unlimited →
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none" />
    </section>
  );
}
