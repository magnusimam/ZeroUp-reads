import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleMore, MessagesSquare, Mail, Bug, ChevronRight } from 'lucide-react';
import { SUPPORT_EMAIL } from '../helpConfig';

const ROW_CLASS = 'flex items-center gap-4 bg-white rounded-xl border border-[#E6ECF5] px-4 py-3.5 shadow-[0_1px_4px_rgba(16,40,90,0.04)] hover:border-[#0B3FAE] hover:-translate-y-0.5 transition';

function RowBody({ icon: Icon, color, title, text }) {
  return (
    <>
      <Icon size={30} strokeWidth={2} className="shrink-0" style={{ color }} aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="block font-nunito font-extrabold text-sm" style={{ color: '#0B1F4D' }}>{title}</span>
        <span className="block font-nunito-sans text-[13px] leading-snug" style={{ color: '#4A5568' }}>{text}</span>
      </span>
      <ChevronRight size={18} className="shrink-0" style={{ color: '#0B1F4D' }} aria-hidden="true" />
    </>
  );
}

export default function StillNeedHelpCard() {
  return (
    <section className="rounded-3xl border border-[#E6ECF5] p-4 sm:p-5" style={{ background: '#F8F7FD' }}>
      <div className="flex items-start gap-3 mb-4 px-1">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: '#05A75B' }}
          aria-hidden="true"
        >
          <MessageCircleMore size={22} />
        </span>
        <div>
          <h2 className="font-nunito font-extrabold text-lg sm:text-xl" style={{ color: '#0B3FAE' }}>Still need help?</h2>
          <p className="font-nunito-sans text-sm" style={{ color: '#1F2A44' }}>Our team is here to support you.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/help/contact" className={ROW_CLASS}>
          <RowBody icon={MessagesSquare} color="#1466E6" title="Contact Support" text="Chat with our friendly team" />
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className={ROW_CLASS}>
          <RowBody icon={Mail} color="#05A75B" title="Send us an Email" text={SUPPORT_EMAIL} />
        </a>
        <Link to="/help/report-a-problem" className={ROW_CLASS}>
          <RowBody icon={Bug} color="#E5323B" title="Report a Problem" text="Found a bug or something not working? Let us know." />
        </Link>
      </div>
    </section>
  );
}
