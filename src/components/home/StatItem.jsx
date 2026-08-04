import React, { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ── STAT BAR COUNT-UP ───────────────────────────────────── */
export default function StatItem({ value, label, delay }) {
  const [ref, visible] = useScrollReveal();
  const [count, setCount] = useState(0);
  const numeric = parseInt(value.toString().replace(/[^0-9]/g, ''), 10);
  const suffix = value.toString().replace(/[0-9]/g, '');
  const hasNumericValue = !Number.isNaN(numeric);

  useEffect(() => {
    if (!visible || !hasNumericValue) return;
    const duration = 1500;
    const steps = 60;
    const increment = numeric / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numeric) {
        setCount(numeric);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, numeric, hasNumericValue]);

  return (
    <div ref={ref} style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
      <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 28, color: 'var(--navy)' }}>
        {hasNumericValue && visible ? `${count}${suffix}` : value}
      </div>
      <div style={{ fontSize: 14, color: 'white', marginTop: 2, fontFamily: 'Nunito Sans' }}>{label}</div>
    </div>
  );
}
