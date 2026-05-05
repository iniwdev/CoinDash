import React from 'react';
import { Link } from 'react-router-dom';

const CTA = React.memo(() => {
  return (
    <section className="section-spacing bg-background fade-in-section">
      <div className="content-width">
        {/* Large Rounded Card Container */}
        <div className="card-base p-16 overflow-hidden">
          {/* Decorative Gradients */}
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary mb-8">
              Ready to get started?
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Take control of your portfolio today
            </h2>

            {/* Supporting Text */}
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
              Join thousands of traders and investors who use CoinDash to track live market insights, spot opportunities, and make smarter decisions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/portfolio" className="btn-primary inline-flex items-center justify-center">
                Get Started Free
              </Link>
              <button type="button" className="btn-secondary">
                View Demo
              </button>
              <button type="button" className="btn-tertiary">
                Learn More
              </button>
            </div>

            {/* Footer Info */}
            <p className="text-xs text-slate-500 mt-8">
              No credit card required. Start tracking crypto in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CTA;