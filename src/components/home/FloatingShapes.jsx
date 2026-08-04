import React from 'react';

/* ── TREE BACKGROUND ANIMATION ─────────────────────────── */
export default function FloatingShapes() {
  const branches = [
    { rotate: '-18deg', top: '24%', delay: '0s', emoji: '📖' },
    { rotate: '0deg', top: '20%', delay: '0.2s', emoji: '🌿' },
    { rotate: '18deg', top: '24%', delay: '0.4s', emoji: '✨' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes treeSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes leafGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { transform: scale(1.08); box-shadow: 0 8px 20px rgba(255,255,255,0.2); }
        }
      `}</style>

      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320, height: 360,
      }}>
        <div style={{
          position: 'absolute', left: '50%', bottom: '8%',
          width: 18, height: '58%',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #7b4f22 0%, #4a2d12 100%)',
          transform: 'translateX(-50%)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        }} />

        <div style={{
          position: 'absolute', left: '50%', top: '18%',
          width: 180, height: 140,
          transform: 'translateX(-50%)',
          animation: 'treeSway 5s ease-in-out infinite',
        }}>
          {branches.map((branch, index) => (
            <div key={index} style={{
              position: 'absolute', left: '50%', top: branch.top,
              width: 150, height: 3,
              background: 'linear-gradient(90deg, #5f3b16 0%, #8f5b25 100%)',
              transformOrigin: '0% 50%',
              transform: `translate(-50%, 0) rotate(${branch.rotate})`,
              animation: `treeSway 4.5s ease-in-out infinite`,
              animationDelay: branch.delay,
            }}>
              <div style={{
                position: 'absolute', right: '-6px', top: '-18px',
                width: 46, height: 46, borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 8px 16px rgba(245,158,11,0.25)',
                animation: 'leafGlow 3s ease-in-out infinite',
                animationDelay: branch.delay,
              }}>
                {branch.emoji}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute', left: '50%', top: '10%',
          width: 70, height: 70, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
          transform: 'translateX(-50%)',
          boxShadow: '0 10px 24px rgba(20,184,166,0.25)',
        }} />
      </div>
    </div>
  );
}
