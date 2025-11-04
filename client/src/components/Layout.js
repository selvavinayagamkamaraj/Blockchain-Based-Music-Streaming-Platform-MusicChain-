import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // <-- Make sure Navbar is imported HERE

/**
 * This component is the main layout for the entire app.
 * It renders the Navbar at the top and then renders the
 * active page (like Profile, Marketplace, etc.) inside the
 * <main> tag.
 */
export default function Layout() {
  return (
    // This div is the main app container
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Navbar />
      
      {/* THIS IS THE LAYOUT FIX:
        This 'pt-28' (padding-top: 7rem) pushes all your
        page content down, so it appears below the fixed navbar.
      */}
      <main className="pt-28">
        {/* The <Outlet /> renders the current page (e.g., AudienceDashboard) */}
        <Outlet />
      </main>
    </div>
  );
}


