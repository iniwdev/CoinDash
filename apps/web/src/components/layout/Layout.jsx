import React from 'react';
import Navbar from "@/components/layout/Navbar";
import './Layout.css';

/**
 * Layout wrapper.
 *
 * Props:
 *   fluid (bool) — when true, removes the default max-width/padding from
 *                  the <main> container so the child page can own its own
 *                  full-width layout. Used by the Portfolio workspace.
 */
const Layout = React.memo(({ children, fluid = false }) => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className={fluid ? 'layout-container--fluid' : 'layout-container'}>
        {children}
      </main>
    </div>
  );
});

export default Layout;