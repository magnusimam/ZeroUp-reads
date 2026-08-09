import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SupportForm from './components/SupportForm';

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-nunito-sans">
      <Navbar />
      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        <Link to="/help" className="inline-block text-charcoal/50 hover:text-cocoa text-sm mb-6">
          ← Back to Help Center
        </Link>
        <SupportForm type="feedback" />
      </div>
      <Footer />
    </div>
  );
}
