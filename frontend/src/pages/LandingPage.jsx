import React from 'react';
import Hero from '../components/Hero.jsx';
import Problem from '../components/Problem.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Features from '../components/Features.jsx';
import MLSection from '../components/MLSection.jsx';
import Roles from '../components/Roles.jsx';
import VisualizationPreview from '../components/VisualizationPreview.jsx';
import CTA from '../components/CTA.jsx';
import Footer from '../components/layout/Footer.jsx';

const LandingPage = ({ onStartAssessment }) => {
  return (
    <div className="relative">
      <div className="particles-overlay" />
      <Hero onStart={onStartAssessment} />
      <Problem />
      <HowItWorks />
      <Features />
      <MLSection />
      <Roles />
      <VisualizationPreview />
      <CTA onStart={onStartAssessment} />
      <Footer />
    </div>
  );
};

export default LandingPage;
