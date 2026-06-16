import { useEffect } from 'react';
import { useAuthStore } from '../services/authStore';
import ParticleBackground from '../components/homepage/ParticleBackground';
import FloatingNav from '../components/homepage/FloatingNav';
import HeroSection from '../components/homepage/HeroSection';
import FeaturesSection from '../components/homepage/FeaturesSection';
import HowItWorksSection from '../components/homepage/HowItWorksSection';
import StatsSection from '../components/homepage/StatsSection';
import TestimonialsSection from '../components/homepage/TestimonialsSection';
import CTASection from '../components/homepage/CTASection';
import Footer from '../components/homepage/Footer';

export default function Homepage() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) loadUser();
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-dark text-white overflow-x-hidden">
      <ParticleBackground />
      <FloatingNav />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
