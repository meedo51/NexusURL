import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../services/authStore';
import { useRef, useEffect, useState } from 'react';

const freeTierFeatures = [
  { icon: '🎁', text: '5 free links per week' },
  { icon: '📊', text: 'Real-time analytics' },
  { icon: '🔐', text: 'Password protection' },
  { icon: '📅', text: 'Expiration dates' },
  { icon: '📱', text: 'QR code generation' },
  { icon: '🌐', text: 'Public API access' },
];

export default function CTASection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={ref} className="relative py-24 lg:py-32 section-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6 border border-white/5">
            💎 Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start For Free —{' '}
            <span className="text-gradient">No Credit Card Required</span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            Get started with our generous free tier. Upgrade anytime for unlimited access.
          </p>
        </div>

        <div className={`max-w-md mx-auto transition-all duration-700 delay-200 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="glass rounded-3xl p-8 lg:p-10 border border-white/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-brand-purple/10 to-brand-coral/10 rounded-full blur-3xl group-hover:from-brand-purple/20 group-hover:to-brand-coral/20 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-brand-cyan/10 to-brand-purple/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Free Forever
                </div>
                <h3 className="font-display text-3xl font-bold text-white mb-2">Free Tier</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display font-bold text-white">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {freeTierFeatures.map((feat) => (
                  <li key={feat.text} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-lg">{feat.icon}</span>
                    <span>{feat.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="w-full py-3.5 rounded-xl text-base font-semibold text-white btn-gradient shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 transition-all duration-300"
              >
                {isAuthenticated ? 'Go to Dashboard →' : 'Get Started Free →'}
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
