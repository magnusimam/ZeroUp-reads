import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CHART_HEIGHT = 150;

// Only "This Week" is a real, working option — userService.getWeeklyActivity()
// only ever persists the current Mon-Sun window (see bumpWeeklyActivity),
// there's no history to page back through. Month/Year stay listed but
// disabled rather than wired to fabricated numbers (repo convention: no
// invented demo data — see useDashboardData's comments).
const RANGE_OPTIONS = [
  { value: 'week', label: 'This Week', available: true },
  { value: 'month', label: 'This Month', available: false },
  { value: 'year', label: 'This Year', available: false },
];

// Pure geometry: turns raw weekly hours into a "nice" axis max (rounded up to
// the next multiple of 3, so the three gridlines below it are always whole
// hours — a multiple of 2 rounds small weeks up to axisMax=2, whose thirds
// are 1.33h/0.67h and both round-display as a duplicate "1h") and gridline
// values, same idea as modules/analytics/pieChart.js's extracted geometry
// math (Separation of Concerns) — kept local since this shape (bars vs. a
// donut) doesn't share code with that module.
function niceAxisMax(hours) {
  const max = Math.max(...hours, 1);
  return Math.max(3, Math.ceil(max / 3) * 3);
}

function RangeDropdown() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState('week');
  const selected = RANGE_OPTIONS.find((o) => o.value === range);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--hero-ink)', padding: '4px 2px',
        }}
      >
        {selected.label} <ChevronDown size={14} color="var(--hero-gray)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            style={{
              position: 'absolute', right: 0, top: '130%', background: 'white', minWidth: 150,
              borderRadius: 12, boxShadow: '0 8px 32px rgba(58,26,16,0.15)', overflow: 'hidden', zIndex: 100,
              margin: 0, padding: 6, listStyle: 'none',
            }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  role="option"
                  aria-selected={opt.value === range}
                  disabled={!opt.available}
                  onClick={() => { setRange(opt.value); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: 'none',
                    background: opt.value === range ? '#FDF1E4' : 'transparent',
                    color: opt.available ? 'var(--hero-ink)' : 'var(--hero-gray)',
                    cursor: opt.available ? 'pointer' : 'not-allowed',
                    fontFamily: 'Nunito Sans', fontSize: 13, fontWeight: opt.value === range ? 700 : 500,
                  }}
                >
                  {opt.label}
                  {!opt.available && <span style={{ fontSize: 10, color: 'var(--hero-gray)' }}>Soon</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function ReadingProgressChart({ weeklyActivity }) {
  const axisMax = niceAxisMax(weeklyActivity.map((d) => d.hours));
  const gridlines = [axisMax, axisMax * (2 / 3), axisMax / 3, 0];

  return (
    <div style={{ background: 'white', border: '1px solid var(--hero-border)', borderRadius: 20, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--hero-ink)' }}>Reading Progress</h2>
        <RangeDropdown />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: CHART_HEIGHT, fontSize: 11, color: 'var(--hero-gray)', fontFamily: 'Nunito Sans' }}>
          {gridlines.map((g) => <span key={g}>{g === 0 ? '0' : `${Math.round(g)}h`}</span>)}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: CHART_HEIGHT }}>
          {weeklyActivity.map((day) => {
            const heightPct = Math.max((day.hours / axisMax) * 100, day.hours > 0 ? 6 : 0);
            return (
              <div key={day.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div
                  title={`${day.label}: ${day.hours}h`}
                  className="progress-bar"
                  style={{
                    width: '62%', maxWidth: 22, height: `${heightPct}%`, minHeight: day.hours > 0 ? 8 : 0,
                    background: 'var(--hero-orange)', borderRadius: 999,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--hero-ink)', fontFamily: 'Nunito' }}>{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .progress-bar { transition: height 400ms ease, opacity 200ms ease; opacity: 0.92; }
        .progress-bar:hover { opacity: 1; }
      `}</style>
    </div>
  );
}
