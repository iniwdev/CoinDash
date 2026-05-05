import React from 'react';
import Navbar from './Navbar';

const Layout = React.memo(({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
});

export default Layout;