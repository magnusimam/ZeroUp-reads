import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Users, Heart, ArrowRight } from 'lucide-react';

const CTA_CARDS = [
  { to: '/help/suggest-a-book', icon: Send, color: '#7C4DDB', bg: '#FDF6FD', title: 'Suggest a Book', text: "Know a story we're missing? Tell us about it." },
  { to: '/help/contact', icon: Users, color: '#05A75B', bg: '#F1FBFA', title: 'Partner with Us', text: 'Schools, NGOs and organizations.' },
  { to: '/help/feedback', icon: Heart, color: '#E5323B', bg: '#FFF7F4', title: 'Give Feedback', text: 'Help us improve ZeroUp Reads.', fill: true },
];

export default function HelpCTABanner() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#F3E6C8] flex flex-col md:flex-row md:items-center gap-5 md:gap-6 pr-4 md:pr-5 pb-5 md:pb-0"
      style={{ background: 'linear-gradient(90deg, #FDF3DC 0%, #FDF7EB 45%, #FBF4E2 100%)' }}
    >
      {/* Girl + QUESTIONS / SUGGESTIONS / BETTER STORIES books, from the design mockup. */}
      <img
        src="/images/help/help-cta-girl-books.jpg"
        alt=""
        aria-hidden="true"
        className="hidden md:block self-end w-[166px] h-auto shrink-0"
      />

      <div className="flex-1 min-w-0 pl-5 md:pl-0 pt-5 md:py-5">
        <h2 className="font-nunito font-extrabold text-xl sm:text-2xl" style={{ color: '#0B1F4D' }}>Can't find what you're looking for?</h2>
        <p className="font-nunito-sans text-sm mt-1 max-w-sm" style={{ color: '#1F2A44' }}>
          Suggest a book, ask a question, or share an idea. We'd love to hear from you!
        </p>
        <Link
          to="/help/contact"
          className="inline-flex items-center gap-2.5 mt-4 px-7 py-3 rounded-full text-white font-nunito font-extrabold text-sm shadow-[0_8px_18px_rgba(5,167,91,0.28)] hover:brightness-105 transition"
          style={{ background: '#0E8A47' }}
        >
          Get in Touch <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-5 md:pl-0 md:py-5 md:w-[50%] shrink-0">
        {CTA_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className="flex flex-col items-center text-center rounded-2xl border border-white px-3 py-4 shadow-[0_4px_14px_rgba(16,40,90,0.06)] hover:-translate-y-1 transition"
              style={{ background: card.bg }}
            >
              <Icon size={32} strokeWidth={2} fill={card.fill ? card.color : 'none'} style={{ color: card.color }} aria-hidden="true" />
              <span className="font-nunito font-extrabold text-sm mt-2" style={{ color: '#0B1F4D' }}>{card.title}</span>
              <span className="font-nunito-sans text-[11px] leading-snug mt-0.5" style={{ color: '#4A5568' }}>{card.text}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
