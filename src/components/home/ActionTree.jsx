import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import ActionCard from './ActionCard';

/* ── ACTION TREE (trunk + 3 branches, each ending in a card-leaf) ── */
export default function ActionTree({ actions }) {
  const [ref, visible] = useScrollReveal(0.1);
  const [leftAction, centerAction, rightAction] = actions;

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 600ms ease',
    }}>
      <style>{`
        @keyframes wholeTreeSway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        .action-tree-scene {
          position: relative;
          height: 620px;
          max-width: 1040px;
          margin: 0 auto;
          transform-origin: 50% 100%;
          animation: wholeTreeSway 6s ease-in-out infinite;
        }
        .action-tree-card {
          position: absolute;
        }
        .action-tree-card--left { left: 4%; top: 46%; }
        .action-tree-card--right { right: 4%; top: 46%; }
        .action-tree-card--center { left: 50%; top: 0; transform: translateX(-50%); }

        @media (max-width: 767px) {
          .action-tree-scene {
            height: auto;
            animation: none;
            transform: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .action-tree-scene svg { display: none; }
          .action-tree-card,
          .action-tree-card--left,
          .action-tree-card--right,
          .action-tree-card--center {
            position: static;
            transform: none;
          }
        }
      `}</style>

      <div className="action-tree-scene">
        <svg
          viewBox="0 0 1000 620"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="trunkGrad" gradientUnits="userSpaceOnUse" x1="500" y1="0" x2="500" y2="620">
              <stop offset="0%" stopColor="#8f5b25" />
              <stop offset="100%" stopColor="#4a2d12" />
            </linearGradient>
          </defs>
          {/* trunk */}
          <path d="M500,620 C500,500 500,420 500,300" stroke="url(#trunkGrad)" strokeWidth="26" strokeLinecap="round" fill="none" />
          {/* center branch — straight up */}
          <path d="M500,300 C500,220 500,150 500,95" stroke="url(#trunkGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* left branch */}
          <path d="M500,300 C380,290 260,330 205,368" stroke="url(#trunkGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* right branch */}
          <path d="M500,300 C620,290 740,330 795,368" stroke="url(#trunkGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
        </svg>

        <div className="action-tree-card action-tree-card--left"><ActionCard action={leftAction} /></div>
        <div className="action-tree-card action-tree-card--center"><ActionCard action={centerAction} /></div>
        <div className="action-tree-card action-tree-card--right"><ActionCard action={rightAction} /></div>
      </div>
    </div>
  );
}
