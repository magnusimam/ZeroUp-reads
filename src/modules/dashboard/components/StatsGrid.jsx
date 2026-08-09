import React from 'react';
import { BookOpen, Clock, Flame, Star } from 'lucide-react';

// Per-stat palette lifted pixel-for-pixel from the dashboard reference mock:
// a soft tinted card (not plain white) with a white icon badge holding a
// solid-colour lucide icon, and a colour-matched sublabel — kept local since
// StatsGrid is the only place this exact 4-stat card shape is used.
const STAT_THEME = {
  orange: { cardBg: 'linear-gradient(180deg, #FDF1E4 0%, #FEF8F1 100%)', iconColor: '#F5720F', border: '#FBE2C8' },
  green: { cardBg: 'linear-gradient(180deg, #E9F6EC 0%, #F5FBF3 100%)', iconColor: '#2F9E4F', border: '#D3EED9' },
  blue: { cardBg: 'linear-gradient(180deg, #EAF0FE 0%, #F4F7FE 100%)', iconColor: '#2F6FED', border: '#D6E2FC' },
  purple: { cardBg: 'linear-gradient(180deg, #F3ECFB 0%, #F9F5FD 100%)', iconColor: '#8B5CF6', border: '#E4D6F7' },
};

function StatCard({ icon, theme, value, label, sublabel, sublabelColor, index }) {
  const t = STAT_THEME[theme];
  return (
    <div
      className="stats-card"
      style={{
        background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 20,
        padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10,
        animation: `statCardIn 420ms ease both`, animationDelay: `${index * 70}ms`,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(58,26,16,0.08)',
      }} aria-hidden="true">
        {React.createElement(icon, { size: 20, color: t.iconColor, strokeWidth: 2.25 })}
      </div>
      <div>
        <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 26, color: 'var(--hero-ink)' }}>{value}</p>
        <p style={{ margin: '2px 0 0', fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>{label}</p>
      </div>
      <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: sublabelColor }}>{sublabel}</p>
    </div>
  );
}

// Reads only the pre-computed `stats` shape useDashboardData hands it —
// every number here traces back to a real persisted metric (userService's
// progress record), not a fabricated demo figure (Separation of Concerns).
export default function StatsGrid({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
      <StatCard
        index={0} icon={BookOpen} theme="orange"
        value={stats.booksCompleted} label="Books Read"
        sublabel={`+${stats.booksCompletedThisWeek} this week`} sublabelColor="#F5720F"
      />
      <StatCard
        index={1} icon={Clock} theme="green"
        value={stats.hoursRead} label="Hours Read"
        sublabel={`+${stats.hoursReadThisWeek} this week`} sublabelColor="#2F9E4F"
      />
      <StatCard
        index={2} icon={Flame} theme="blue"
        value={stats.streak} label="Reading Streak"
        sublabel="days in a row" sublabelColor="var(--hero-gray)"
      />
      <StatCard
        index={3} icon={Star} theme="purple"
        value={stats.achievementsUnlocked} label="Achievements"
        sublabel="Badges Earned" sublabelColor="var(--hero-gray)"
      />

      <style>{`
        @keyframes statCardIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .stats-card { transition: transform 200ms ease, box-shadow 200ms ease; }
        .stats-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(58,26,16,0.12); }
      `}</style>
    </div>
  );
}
