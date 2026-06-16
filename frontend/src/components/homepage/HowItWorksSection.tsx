import { useRef, useEffect, useState } from 'react';

const steps = [
  {
    step: 1,
    icon: '📋',
    title: 'Copy',
    description: 'Copy the long URL you want to shorten from your browser, document, or anywhere.',
    gradient: 'from-brand-purple to-primary-500',
  },
  {
    step: 2,
    icon: '⚡',
    title: 'Shorten',
    description: 'Paste it into NexusURL, optionally customize with an alias, password, or expiration.',
    gradient: 'from-brand-coral to-orange-500',
  },
  {
    step: 3,
    icon: '🌐',
    title: 'Share',
    description: 'Share your sleek short URL anywhere — social media, emails, or print with a QR code.',
    gradient: 'from-brand-cyan to-blue-500',
  },
];

export default function HowItWorksSection() {
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
    <section id="how-it-works" ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6 border border-white/5">
            🚀 How It Works
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Three Simple <span className="text-gradient">Steps</span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            Get started in seconds. No account required for basic shortening.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`relative transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="glass rounded-2xl p-8 lg:p-10 text-center glass-hover border border-white/5">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-coral/20 rounded-2xl blur-xl" />
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                    {step.icon}
                  </div>
                </div>

                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm font-bold text-brand-cyan mb-4 border border-white/10">
                  {step.step}
                </div>

                <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10" aria-hidden="true">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full bg-brand-purple/40 animate-glow`}
                        style={{ animationDelay: `${dot * 0.3}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
