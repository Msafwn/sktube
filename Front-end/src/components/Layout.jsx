import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Tablet auto-collapse mini-sidebar (768px - 1100px), expanded on desktop (>= 1100px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1100) {
        setIsSidebarCollapsed(true);
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 1100) {
        setIsSidebarCollapsed(false);
        setIsMobileOpen(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const closeMobileSidebar = React.useCallback(() => {
    setIsMobileOpen(false);
  }, []);


  return (
    <div className="min-h-screen bg-[#08080c] text-[#f4f4f5] relative overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="ambient-glow top-0 left-1/4 w-[400px] sm:w-[600px] h-[300px] bg-rose-600/10 rounded-full"></div>
      <div className="ambient-glow top-1/3 right-4 w-[400px] sm:w-[600px] h-[400px] bg-indigo-600/10 rounded-full"></div>

      {/* 1. Top Glass Navbar */}
      <Navbar 
        toggleSidebar={toggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed}
        currentUser={user}
        logout={logout}
      />

      {/* 2. Main Body Container with Sidebar & Content */}
      <div className="flex pt-16 min-h-screen">
        {/* Responsive Desktop / Tablet Dock (Mini Sidebar) / Mobile Drawer */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileOpen={isMobileOpen}
          closeMobileSidebar={closeMobileSidebar}
          currentUser={user}
          logout={logout}
        />

        {/* Dynamic Scrollable Content Area */}
        <main 
          className={`flex-1 p-3.5 sm:p-6 lg:p-8 transition-all duration-300 relative z-10 w-full overflow-hidden pb-24 md:pb-8 ${
            // Margin on Desktop & Tablet (768px+)
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Phones only < 768px) */}
      <BottomNav />
    </div>
  );
};

export default Layout;
