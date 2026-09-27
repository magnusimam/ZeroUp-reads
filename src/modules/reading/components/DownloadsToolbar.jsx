import React from 'react';
import { HardDrive } from 'lucide-react';
import { DOWNLOAD_TABS } from '../useDownloadsPage';

export default function DownloadsToolbar({ activeTab, onTabChange, usedLabel, quotaLabel, usedPercent, onManageStorage }) {
  return (
    <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2.5">
        {DOWNLOAD_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-nunito font-bold border transition-colors"
              style={
                active
                  ? { background: 'var(--sky-blue, #2D6BE4)', color: 'white', borderColor: 'var(--sky-blue, #2D6BE4)' }
                  : { background: 'white', color: 'var(--hero-ink)', borderColor: 'var(--hero-border)' }
              }
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#E8F2FF', color: 'var(--sky-blue, #2D6BE4)' }} aria-hidden="true">
          <HardDrive size={16} />
        </span>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <button onClick={onManageStorage} className="text-left">
            <span className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>{usedLabel} used</span>
            <span className="font-nunito-sans text-xs ml-1" style={{ color: 'var(--hero-gray)' }}>of {quotaLabel}</span>
          </button>
          <div className="w-36 h-1.5 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${usedPercent}%`, background: 'var(--sky-blue, #2D6BE4)' }} />
          </div>
        </div>
        <button onClick={onManageStorage} className="font-nunito font-bold text-xs hover:underline whitespace-nowrap" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>
          Manage Storage →
        </button>
      </div>
    </div>
  );
}
