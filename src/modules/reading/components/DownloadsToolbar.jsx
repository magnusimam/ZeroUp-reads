import React from 'react';
import { LayoutGrid, BookOpen, Headphones, FileText, Bookmark, Save, ArrowRight } from 'lucide-react';
import { DOWNLOAD_TABS } from '../useDownloadsPage';

// Presentation-only: icon + accent per tab id (the tab list itself lives in
// useDownloadsPage so the hook and the toolbar can't drift).
const TAB_ICONS = {
  all: { icon: LayoutGrid, color: '#1466E6' },
  books: { icon: BookOpen, color: '#1466E6' },
  audio: { icon: Headphones, color: '#8B3FD9' },
  activities: { icon: FileText, color: '#1E9BE9' },
  articles: { icon: Bookmark, color: '#F26A1B' },
};

export default function DownloadsToolbar({ activeTab, onTabChange, usedLabel, quotaLabel, usedPercent, onManageStorage }) {
  return (
    <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2.5 mobile-scroll-row max-w-full p-1 -m-1" role="tablist" aria-label="Download types">
        {DOWNLOAD_TABS.map(tab => {
          const active = activeTab === tab.id;
          const { icon: Icon, color } = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-nunito font-bold transition-all ${
                active ? 'shadow-[0_6px_16px_rgba(20,102,230,0.30)]' : 'bg-white shadow-[0_2px_10px_rgba(16,40,90,0.07)] hover:-translate-y-0.5'
              }`}
              style={active ? { background: '#1466E6', color: '#fff' } : { color: '#0B1F4D' }}
            >
              <Icon size={18} style={{ color: active ? '#fff' : color }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#E6ECF5] shadow-[0_2px_10px_rgba(16,40,90,0.06)] px-4 py-3">
        <Save size={28} strokeWidth={1.8} style={{ color: '#1466E6' }} aria-hidden="true" />
        <div className="leading-tight mr-3">
          <p className="font-nunito font-extrabold text-[13px]" style={{ color: '#0B1F4D' }}>{usedLabel} used</p>
          <p className="font-nunito-sans text-[11px]" style={{ color: '#6B7280' }}>of {quotaLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onManageStorage}
            className="flex items-center gap-1 font-nunito font-bold text-[11px] hover:underline whitespace-nowrap"
            style={{ color: '#1466E6' }}
          >
            Manage Storage <ArrowRight size={12} />
          </button>
          <div className="w-32 h-1.5 rounded-full bg-[#E6ECF5] overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${usedPercent}%`, background: '#1466E6' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
