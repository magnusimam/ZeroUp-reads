import React from 'react';
import { PROFILE_TABS } from '../useProfileData';

export default function ProfileTabs({ activeTab, onChange }) {
  return (
    <div className="max-w-content mx-auto w-full px-4 sm:px-6 mt-6 flex flex-wrap gap-2 overflow-x-auto mobile-scroll-row">
      {PROFILE_TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-nunito font-bold border shrink-0 transition-colors"
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
  );
}
