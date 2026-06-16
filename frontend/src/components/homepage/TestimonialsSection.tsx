import { useRef, useEffect, useState } from 'react';

const testimonials = [
  {
    quote: 'Best URL shortener I\'ve ever used! The speed and reliability are unmatched.',
    author: 'Alex M.',
    role: 'Digital Marketer',
    rating: 5,
    gradient: 'from-brand-purple to-primary-500',
    delay: 0,
  },
  {
    quote: 'The analytics are a game-changer. I can see exactly where my clicks come from.',
    author: 'Priya K.',
    role: 'Content Creator',
    rating: 5,
    gradient: 'from-brand-coral to-orange-500',
    delay: 150,
  },
  {
    quote: 'Beautiful design and incredibly fast. My team switched from Bitly and never looked back.',
    author: 'James R.',
    role: 'Product Manager',
    rating: 5,
    gradient: 'from-brand-cyan to-blue-500',
    delay: 300,
  },
];

export default function TestimonialsSection() {
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
    <section id="testimonials" ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6 border border-white/5">
            💬 Testimonials
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our <span className="text-gradient">Users Say</span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            Join thousands of satisfied users who trust NexusURL for their link management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className={`glass rounded-2xl p-6 lg:p-8 glass-hover border border-white/5 transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${t.delay}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="text-lg">⭐</span>
                ))}
              </div>
              <blockquote className="text-gray-300 text-sm lg:text-base leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.author}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
