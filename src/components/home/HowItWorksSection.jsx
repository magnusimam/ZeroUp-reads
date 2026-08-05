import React from 'react';
import { Lightbulb, Languages, Mic, Laptop, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { HOW_IT_WORKS_STEPS } from './howItWorksConfig';
import AmbientDecor from './AmbientDecor';

const ICONS = { lightbulb: Lightbulb, languages: Languages, mic: Mic, laptop: Laptop, sparkles: Sparkles };

export default function HowItWorksSection() {
  const [ref, visible] = useScrollReveal(0.1);

  return (
    <section style={{ background: 'white', padding: '72px 0', position: 'relative', overflow: 'hidden' }}>
      <AmbientDecor count={4} offset={2} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 32, color: 'var(--navy)', textAlign: 'center', margin: '0 0 56px' }}>
          How ZeroUp Reads Works
        </h2>

        <div ref={ref} style={{ position: 'relative', display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Connecting dashed line — desktop only. Uses a Tailwind utility
              (not the app's .hidden-mobile class, which only exists inside
              Navbar.jsx's own <style> tag and isn't in scope on this
              Navbar-less page) so it actually hides below the sm breakpoint. */}
          <div className="hidden sm:block" style={{ position: 'absolute', top: 30, left: '8%', right: '8%', pointerEvents: 'none' }}>
            <svg width="100%" height="4">
              <line
                x1="0%" y1="2" x2="100%" y2="2"
                stroke="var(--navy)" strokeWidth="2" strokeDasharray="8 7"
                strokeDashoffset={visible ? 0 : 500}
                style={{ transition: 'stroke-dashoffset 1400ms ease 400ms' }}
              />
            </svg>
          </div>

          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = ICONS[step.icon];
            return (
              <div
                key={step.key}
                style={{
                  width: 160, textAlign: 'center', position: 'relative',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `all 500ms ease ${i * 120}ms`,
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', boxShadow: `0 8px 20px ${step.bg}55`,
                  animation: visible ? `float ${3 + i * 0.3}s ease-in-out ${i * 0.15}s infinite` : 'none',
                }}>
                  <Icon size={26} color="white" strokeWidth={2.25} />
                </div>
                <p style={{ fontFamily: 'Nunito Sans', fontWeight: 600, fontSize: 14, color: 'var(--charcoal)', margin: 0, lineHeight: 1.5 }}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
