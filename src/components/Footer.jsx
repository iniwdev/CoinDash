import React from 'react';

const Footer = React.memo(() => {
  const footerColumns = [
    {
      title: 'Explore',
      links: ['Markets', 'Coins', 'Charts', 'Trending', 'Gainers'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact'],
    },
    {
      title: 'Useful Tools',
      links: ['Portfolio Tracker', 'Price Alerts', 'Market News', 'API Docs', 'Webhooks'],
    },
    {
      title: 'Additional Products',
      links: ['Mobile App', 'Web Platform', 'Browser Extension', 'Desktop', 'VIP Pro'],
    },
    {
      title: 'Policies',
      links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Disclaimer', 'Compliance'],
    },
    {
      title: 'Support',
      links: ['Help Center', 'FAQ', 'Contact Support', 'Report Bug', 'Feedback'],
    },
  ];

  return (
    <footer className="bg-background fade-in-section">
      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Footer Content */}
      <div className="section-spacing">
        <div className="content-width">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
                  {column.title}
                </h3>
                <nav className="space-y-4">
                  {column.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="text-sm text-slate-400 transition duration-200 hover:text-white"
                    >
                      {link}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-8" />

          {/* Copyright Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} CoinDash. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 transition duration-200 hover:text-white">
                Terms
              </a>
              <a href="#" className="text-slate-400 transition duration-200 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-slate-400 transition duration-200 hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;