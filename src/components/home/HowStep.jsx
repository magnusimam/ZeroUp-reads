import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ── HOW-IT-WORKS STEP ───────────────────────────────────── */
export default function HowStep({ number, numBg, emoji, title, caption, delay }) {
  const [ref, visible] = useScrollReveal(0.2);
  return (
    <div ref={ref} style={{
      textAlign: 'center', flex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 500ms ease ${delay}`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: numBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, color: 'white',
        margin: '0 auto 20px',
        boxShadow: `0 8px 24px ${numBg}55`,
      }}>{number}</div>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--navy)', marginBottom: 8, margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 18, color: 'var(--charcoal)', margin: 0, fontFamily: 'Nunito Sans' }}>{caption}</p>
    </div>
  );
}
