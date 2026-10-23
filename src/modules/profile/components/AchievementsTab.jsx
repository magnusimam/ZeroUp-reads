import React from 'react';

export default function AchievementsTab({ achievements }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {achievements.map(a => (
        <div
          key={a.id}
          className="rounded-2xl p-5 flex flex-col items-center text-center gap-2 border"
          style={{
            background: a.achieved ? '#FFF3E0' : '#F5F6F8',
            borderColor: a.achieved ? '#FBD9AC' : 'var(--hero-border)',
            opacity: a.achieved ? 1 : 0.6,
          }}
        >
          <span className="text-3xl" aria-hidden="true">{a.icon}</span>
          <p className="font-nunito font-extrabold text-sm" style={{ color: 'var(--hero-ink)' }}>{a.label}</p>
          <p className="font-nunito-sans text-[11px]" style={{ color: 'var(--hero-gray)' }}>
            {a.achieved ? 'Unlocked' : 'Locked'}
          </p>
        </div>
      ))}
    </div>
  );
}
