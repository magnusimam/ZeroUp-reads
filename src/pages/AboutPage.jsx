import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🚧</div>
        <h2 style={{ fontFamily: 'Nunito', color: 'var(--navy)' }}>AboutPage</h2>
        <p style={{ color: '#888', fontFamily: 'Nunito Sans' }}>Coming in the next build phase.</p>
      </div>
      <Footer />
    </div>
  );
}
