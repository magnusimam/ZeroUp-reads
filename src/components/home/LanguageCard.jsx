import React, { useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ── LANGUAGE CARD ───────────────────────────────────────── */
export default function LanguageCard({ flag, name, example, bookCount, delay }) {
  const [ref, visible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={{
      background: 'var(--cream)',
      borderRadius: 16,
      padding: '28px 20px',
      textAlign: 'center',
      border: hovered ? '2px solid var(--navy)' : '2px solid transparent',
      transform: hovered ? 'scale(1.04)' : visible ? 'scale(1)' : 'scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: `all 300ms ease ${delay}`,
      cursor: 'pointer',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 48, marginBottom: 10 }}>{flag}</div>
      <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22, color: 'var(--navy)', marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 16, color: 'var(--charcoal)', marginBottom: 8, fontFamily: 'Nunito Sans' }}>{example}</div>
      <div style={{ fontSize: 14, color: 'var(--amber)', fontWeight: 700, fontFamily: 'Nunito' }}>{bookCount}</div>
    </div>
  );
}
