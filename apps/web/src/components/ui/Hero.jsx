import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = React.memo(() => {
  return (
    <motion.section 
      className="relative w-full bg-background overflow-hidden py-32 sm:py-40 md:py-48"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Purple/Orange Blur Orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent via-primary to-accent rounded-full blur-3xl opacity-20 animate-glow"></div>
        {/* Secondary Glow */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-l from-primary to-accent rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-accent to-primary rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 content-width">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          {/* Main Heading */}
          <h1 className="animate-fade-in text-6xl sm:text-7xl md:text-8xl font-bold font-inter leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-accent">
              Track Your Crypto
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              Portfolio
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Stay updated with real-time prices, market trends, and manage your investments effortlessly.
          </p>

          {/* CTA Button */}
          <div className="animate-float pt-6">
            <Link to="/portfolio" className="btn-primary inline-flex items-center justify-center gap-3">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

export default Hero;