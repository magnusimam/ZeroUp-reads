import React from 'react';
import { Link } from 'react-router-dom';

export default function ActionCard({ action }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      padding: '32px 22px 26px',
      boxShadow: '0 10px 28px rgba(0,0,0,0.09)',
      border: `2px solid ${action.bg}`,
      width: 250,
      textAlign: 'center',
      transition: 'transform 200ms ease, box-shadow 200ms ease',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 16px 36px ${action.bg}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.09)';
      }}
    >
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, margin: '0 auto 16px',
        boxShadow: `0 8px 18px ${action.bg}`,
      }}>
        {action.emoji}
      </div>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, color: action.color, marginBottom: 10, margin: '0 0 10px' }}>
        {action.title}
      </h3>
      <p style={{ fontFamily: 'Nunito Sans', fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 18, margin: '0 0 18px' }}>
        {action.description}
      </p>
      <Link
        to={action.link}
        style={{
          display: 'inline-block',
          background: action.color,
          color: 'white',
          fontFamily: 'Nunito',
          fontWeight: 700,
          fontSize: 13,
          padding: '9px 20px',
          borderRadius: 99,
          textDecoration: 'none',
          transition: 'opacity 200ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {action.cta}
      </Link>
    </div>
  );
}
