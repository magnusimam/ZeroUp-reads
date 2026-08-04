import React, { useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ── FEATURE CARD ────────────────────────────────────────── */
export default function FeatureCard({ icon, iconBg, title, body, delay }) {
  const [ref, visible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={{
      background: 'white',
      borderRadius: 16,
      padding: '32px',
      boxShadow: '0 8px 32px rgba(31,61,110,0.08)',
      transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(30px)',
      opacity: visible ? 1 : 0,
      transition: `all 400ms ease ${delay}`,
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 600ms ease',
        boxShadow: `0 8px 24px ${iconBg}44`,
      }}>{icon}</div>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--navy)', marginBottom: 12, margin: '0 0 12px' }}>{title}</h3>
      <p style={{ fontSize: 16, color: '#555', lineHeight: 1.7, margin: 0, fontFamily: 'Nunito Sans' }}>{body}</p>
    </div>
  );
}
