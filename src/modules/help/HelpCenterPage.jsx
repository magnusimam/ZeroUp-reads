import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FAQAccordion from './components/FAQAccordion';

const QUICK_LINKS = [
  { to: '/help/contact', icon: '💬', label: 'Contact Support', text: 'Get help from our team' },
  { to: '/help/report-a-problem', icon: '🐞', label: 'Report a Problem', text: 'Something not working right?' },
  { to: '/help/suggest-a-book', icon: '📚', label: 'Suggest a Book', text: "Know a story we're missing?" },
  { to: '/help/feedback', icon: '⭐', label: 'Share Feedback', text: 'Tell us how we\'re doing' },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-nunito-sans">
      <Navbar />

      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        <div className="text-center mb-10">
          <span className="text-5xl inline-block mb-3" aria-hidden="true">❓</span>
          <h1 className="font-playfair font-extrabold text-3xl sm:text-4xl text-cocoa">
            How can we help?
          </h1>
          <p className="text-charcoal/60 mt-3 max-w-xl mx-auto">
            Browse frequently asked questions, or reach out directly below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-2xl shadow-card p-5 text-center hover:-translate-y-1 hover:shadow-card-hover transition-all"
            >
              <span className="text-3xl inline-block mb-2" aria-hidden="true">{link.icon}</span>
              <p className="font-nunito font-bold text-sm text-charcoal">{link.label}</p>
              <p className="font-nunito-sans text-xs text-charcoal/50 mt-1">{link.text}</p>
            </Link>
          ))}
        </div>

        <h2 className="font-playfair font-bold text-xl text-cocoa mb-5 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto">
          <FAQAccordion />
        </div>
      </div>

      <Footer />
    </div>
  );
}
