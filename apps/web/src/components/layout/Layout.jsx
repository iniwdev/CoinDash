import React from 'react';
import Navbar from "@/components/layout/Navbar";
import './Layout.css';

const Layout = React.memo(({ children }) => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-container">
        {children}
      </main>
    </div>
  );
});

export default Layout;