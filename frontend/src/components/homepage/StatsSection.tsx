import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: '2.4M+', label: 'Links Created', icon: '🔗', suffix: '+', gradient: 'from-brand-purple to-primary-500' },
  { value: '15.2K', label: 'Active Users', icon: '👥', suffix: '+', gradient: 'from-brand-coral to-orange-500' },
  { value: '99.9', label: 'Uptime', icon: '⚡', suffix: '%', gradient: 'from-green-500 to-emerald-500' },
  { value: '4.8', label: 'User Rating', icon: '⭐', suffix: '⭐', gradient: 'from-yellow-500 to-orange-500' },
];

function CountUp({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || counted.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const isFloat = target % 1 !== 0;

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));

            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsSection() {
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
    <section id="stats" ref={ref} className="relative py-24 lg:py-32 section-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6 border border-white/5">
            📈 By The Numbers
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            NexusURL <span className="text-gradient">By The Numbers</span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            Our platform is growing fast. Join thousands of satisfied users worldwide.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`glass rounded-2xl p-6 lg:p-8 text-center glass-hover border border-white/5 transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="font-display text-3xl lg:text-4xl font-bold text-white mb-2">
                <CountUp
                  target={parseFloat(stat.value.replace(/[^0-9.]/g, ''))}
                  suffix={stat.suffix}
                  duration={2500}
                />
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={`mt-12 glass rounded-2xl p-8 lg:p-10 text-center border border-white/5 transition-all duration-700 delay-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-xl animate-bounce-gentle" style={{ animationDelay: `${star * 0.1}s` }}>⭐</span>
            ))}
          </div>
          <blockquote className="text-lg lg:text-xl text-gray-300 italic max-w-3xl mx-auto mb-4">
            &ldquo;NexusURL has transformed how we share links with our global audience. The analytics are invaluable.&rdquo;
          </blockquote>
          <cite className="text-sm text-gray-500 not-italic">
            — Sarah Chen, CEO TechFlow
          </cite>
        </div>
      </div>
    </section>
  );
}
