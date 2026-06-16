import { useRef, useEffect, useState } from 'react';

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Shorten URLs in milliseconds with our optimized engine. No waiting, just instant results.',
    gradient: 'from-brand-purple to-primary-500',
    delay: 0,
  },
  {
    icon: '🔒',
    title: 'Fort Knox Security',
    description: 'Password protect your links, set expiration dates, and enable one-time access for sensitive content.',
    gradient: 'from-brand-coral to-orange-500',
    delay: 100,
  },
  {
    icon: '🎨',
    title: 'Custom Branding',
    description: 'Create memorable custom aliases that reinforce your brand identity and increase click-through rates.',
    gradient: 'from-brand-cyan to-blue-500',
    delay: 200,
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Track every click with real-time data including location, device, browser, and referral sources.',
    gradient: 'from-green-500 to-emerald-500',
    delay: 300,
  },
  {
    icon: '🎯',
    title: 'QR Generator',
    description: 'Instantly generate QR codes for your shortened URLs — perfect for print materials and offline sharing.',
    gradient: 'from-brand-purple to-brand-cyan',
    delay: 400,
  },
  {
    icon: '🔗',
    title: 'API First',
    description: 'Integrate NexusURL with your applications using our developer-friendly REST API with simple GET parameters.',
    gradient: 'from-primary-500 to-brand-coral',
    delay: 500,
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), feature.delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [feature.delay]);

  return (
    <div
      ref={ref}
      className={`glass rounded-2xl p-6 lg:p-8 glass-hover transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
        {feature.icon}
      </div>
      <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">{feature.title}</h3>
      <p className="text-sm lg:text-base text-gray-400 leading-relaxed">{feature.description}</p>
    </div>
  );
}

export default function FeaturesSection() {
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
    <section id="features" ref={ref} className="relative py-24 lg:py-32 section-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6 border border-white/5">
            ✨ Features
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Features That Make{' '}
            <span className="text-gradient">NexusURL Magical</span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            Everything you need to manage, track, and optimize your links in one beautiful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
