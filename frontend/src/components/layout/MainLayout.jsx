import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const MainLayout = ({ children, setView }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-50 w-full">
      <div className="gradient-bg"></div>
      <div className="particles-overlay"></div>
      
      <Navbar setView={setView} />
      
      <main className="relative z-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
