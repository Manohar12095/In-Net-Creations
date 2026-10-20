'use client';

import { useEffect } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Services from '../components/Services';
import CaseStudy from '../components/CaseStudy';
import Portfolio from '../components/Portfolio';
import MotionGallery from '../components/MotionGallery';
import Process from '../components/Process';
import About from '../components/About';
import BentoGallery from '../components/BentoGallery';
import CTABanner from '../components/CTABanner';
import Contact from '../components/Contact';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import BackToTop from '../components/BackToTop';
import AIChatbot from '../components/AIChatbot';

/**
 * Home — Main page composing all sections in order.
 * Initializes scroll-reveal animations and custom cursor.
 */
export default function Home() {
  useEffect(() => {
    // ── Scroll Reveal (Intersection Observer) ──
    const revealElements = document.querySelectorAll('.reveal');
    if (typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* A. Announcement Bar */}
      <AnnouncementBar />

      {/* B. Navigation */}
      <Navbar />

      <main>
        {/* C. Hero Section */}
        <Hero />

        {/* D. Marquee Strip */}
        <Marquee />

        {/* F. Services Section */}
        <Services />

        {/* G. Featured Case Study */}
        <CaseStudy />

        {/* G.5 Bento Gallery */}
        <BentoGallery />

        {/* H. Portfolio Grid */}
        <Portfolio />

        {/* H.5 Motion Gallery (Pinned Scroll-Driven Split-Screen Gallery) */}
        <MotionGallery />

        {/* I. Process Section */}
        <Process />

        {/* J. About / Team Section */}
        <About />

        {/* N. CTA Banner */}
        <CTABanner />

        {/* O. Contact Section */}
        <Contact />

        {/* P. Newsletter Strip */}
        <Newsletter />
      </main>

      {/* Q. Footer */}
      <Footer />

      {/* Floating Elements */}
      <WhatsAppButton />
      <BackToTop />
      <AIChatbot />
    </>
  );
}
