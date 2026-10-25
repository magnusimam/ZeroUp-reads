import React from 'react';
import { UserPlus, BookOpen, MessagesSquare, Headphones, Download, Users, Settings, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { HELP_TOPICS } from '../helpConfig';

const TOPIC_ICONS = {
  'getting-started': UserPlus,
  reading: BookOpen,
  languages: MessagesSquare,
  audio: Headphones,
  offline: Download,
  parents: Users,
  account: Settings,
  safety: ShieldCheck,
};

export default function HelpTopicsGrid({ activeTopic, onSelectTopic, onViewAll }) {
  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-start gap-3">
          <span className="text-[32px] leading-none" aria-hidden="true">📖</span>
          <div>
            <h2 className="font-nunito font-extrabold text-xl sm:text-2xl" style={{ color: '#0B3FAE' }}>Browse Help Topics</h2>
            <p className="font-nunito-sans text-sm" style={{ color: '#4A5568' }}>Find quick answers organized by topic.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 font-nunito font-extrabold text-sm hover:underline mt-2"
          style={{ color: '#0B1F4D' }}
        >
          View all topics <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {HELP_TOPICS.map(topic => {
          const Icon = TOPIC_ICONS[topic.id];
          const active = activeTopic === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic.id)}
              aria-pressed={active}
              className={`relative text-left rounded-2xl p-4 sm:p-5 min-h-[120px] border transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(16,40,90,0.10)] ${
                active ? 'shadow-[0_10px_24px_rgba(16,40,90,0.12)]' : 'shadow-[0_2px_10px_rgba(16,40,90,0.05)]'
              }`}
              style={{ background: topic.bg, borderColor: active ? topic.color : '#E6ECF5' }}
            >
              <ChevronRight size={18} strokeWidth={2.6} className="absolute top-4 right-4" style={{ color: topic.color }} aria-hidden="true" />
              <Icon size={30} strokeWidth={2} style={{ color: topic.color }} aria-hidden="true" />
              <p className="font-nunito font-extrabold text-[14px] sm:text-[15px] leading-snug mt-3 pr-3" style={{ color: '#0B1F4D' }}>{topic.title}</p>
              <p className="font-nunito-sans text-[12px] sm:text-[13px] leading-snug mt-0.5" style={{ color: '#4A5568' }}>{topic.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
