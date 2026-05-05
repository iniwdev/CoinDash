import React from 'react';

const WalletConnect = React.memo(() => {
  const wallets = [
    { name: 'MetaMask', icon: '🦊' },
    { name: 'WalletConnect', icon: '🔗' },
    { name: 'Coinbase Wallet', icon: '📱' },
    { name: 'Trust Wallet', icon: '🔐' },
  ];

  return (
    <section className="section-spacing bg-background fade-in-section">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary to-transparent rounded-full blur-3xl opacity-5"></div>
      </div>

      <div className="content-width">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose your preferred wallet to get started with CoinDash</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-[0_20px_40px_-16px_rgba(247,147,26,0.3)] hover:-translate-y-2"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-[280px]">
                {/* Icon */}
                <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110 mb-4">
                  {wallet.icon}
                </div>

                {/* Wallet Name */}
                <h3 className="text-lg font-semibold text-white mb-6 text-center">
                  {wallet.name}
                </h3>

                {/* Connect Link with Arrow */}
                <div className="flex items-center gap-2 text-slate-300 group-hover:text-primary transition-colors duration-300">
                  <span className="text-sm font-medium">Connect</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default WalletConnect;