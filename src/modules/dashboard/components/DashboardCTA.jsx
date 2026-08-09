import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardCTA() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #FDEEE3 0%, #FFF8ED 100%)',
      border: '1px solid var(--hero-border)', borderRadius: 22,
      padding: '18px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 26 }} aria-hidden="true">🏆</span>
        <div>
          <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--hero-ink)' }}>
            Stories today, leaders tomorrow.
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>
            Building knowledge. Sparking curiosity. Shaping the future.
          </p>
        </div>
      </div>

      <Link to="/library" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--hero-ink)', color: 'white',
        borderRadius: 999, padding: '12px 22px', textDecoration: 'none',
        fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap',
      }}>Start Reading Now →</Link>
    </div>
  );
}
