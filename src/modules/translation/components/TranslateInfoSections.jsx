import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, UserCheck, Send, ChevronDown, ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_STEPS, TRANSLATE_FAQ } from '../translatePageConfig';

const H2 = ({ children }) => (
  <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl" style={{ color: 'var(--hero-ink)' }}>{children}</h2>
);

export function HowItWorksSection({ onStart }) {
  return (
    <section id="translate-how" className="scroll-mt-24">
      <H2>How it works</H2>
      <p className="font-nunito-sans text-sm sm:text-base mt-1 mb-6" style={{ color: 'var(--hero-gray)' }}>Four simple steps — no account needed.</p>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOW_IT_WORKS_STEPS.map((s, i) => (
          <li key={s.title} className="relative rounded-3xl bg-white border p-5" style={{ borderColor: 'var(--hero-border)' }}>
            <span className="absolute top-4 right-4 font-nunito font-black text-3xl" style={{ color: 'rgba(242,106,27,0.15)' }} aria-hidden="true">{i + 1}</span>
            <span className="text-3xl" aria-hidden="true">{s.icon}</span>
            <p className="font-nunito font-extrabold text-base mt-3" style={{ color: 'var(--hero-ink)' }}>{s.title}</p>
            <p className="font-nunito-sans text-sm mt-1 leading-relaxed" style={{ color: 'var(--hero-gray)' }}>{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 h-11 rounded-full text-white font-nunito font-extrabold text-sm hover:scale-[1.03] transition"
          style={{ background: 'var(--hero-green)' }}
        >
          Try it now <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

export function AboutTranslationNote() {
  return (
    <section className="rounded-3xl p-5 sm:p-6 flex gap-4" style={{ background: '#EEF5FF', border: '1px solid #DCE8FB' }}>
      <Info size={26} className="shrink-0 mt-0.5" style={{ color: '#1466E6' }} aria-hidden="true" />
      <div>
        <h3 className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>About this translation</h3>
        <ul className="font-nunito-sans text-sm mt-2 space-y-1.5 leading-relaxed list-disc pl-5" style={{ color: 'var(--hero-ink)' }}>
          <li>For now, stories are translated by machine while our own AI translator for African languages is being built — so it may not be perfect.</li>
          <li>When our team has already translated a book by hand, you'll see <strong>"By our team"</strong> and we'll open that version instead.</li>
          <li>Kanuri, Tiv, Efik and Pidgin aren't available for instant translation yet — request a human translation below.</li>
          <li>Pages you translate are saved on your device, so you can read them again offline.</li>
        </ul>
      </div>
    </section>
  );
}

export function HelpImproveSection({ onRequestHuman }) {
  return (
    <section>
      <H2>Help make translations better</H2>
      <p className="font-nunito-sans text-sm sm:text-base mt-1 mb-6" style={{ color: 'var(--hero-gray)' }}>
        Every story gets checked and polished by native speakers before it becomes an official ZeroUp Reads translation.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 flex flex-col gap-3" style={{ background: '#FFF6EC', border: '1px solid #F8E3C8' }}>
          <Send size={28} style={{ color: 'var(--hero-orange)' }} aria-hidden="true" />
          <p className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>Request a human translation</p>
          <p className="font-nunito-sans text-sm leading-relaxed" style={{ color: 'var(--hero-gray)' }}>
            Want a story properly translated into your language — including Kanuri, Tiv, Efik or Pidgin? Ask our translation team.
          </p>
          <button
            type="button"
            onClick={onRequestHuman}
            className="self-start mt-auto inline-flex items-center gap-2 px-5 h-11 rounded-full text-white font-nunito font-extrabold text-sm"
            style={{ background: 'var(--hero-orange)' }}
          >
            Request a translation <ArrowRight size={16} />
          </button>
        </div>
        <div className="rounded-3xl p-6 flex flex-col gap-3" style={{ background: '#EEF8F1', border: '1px solid #D3EDDC' }}>
          <UserCheck size={28} style={{ color: 'var(--hero-green)' }} aria-hidden="true" />
          <p className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>Become a translator</p>
          <p className="font-nunito-sans text-sm leading-relaxed" style={{ color: 'var(--hero-gray)' }}>
            Speak Hausa, Yoruba, Igbo or another African language? Help us translate and review stories for children.
          </p>
          <Link
            to="/help/contact"
            className="self-start mt-auto inline-flex items-center gap-2 px-5 h-11 rounded-full text-white font-nunito font-extrabold text-sm"
            style={{ background: 'var(--hero-green)' }}
          >
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TranslateFAQSection() {
  const [openQ, setOpenQ] = useState(null);
  return (
    <section>
      <H2>Questions</H2>
      <ul className="mt-5 flex flex-col gap-2.5">
        {TRANSLATE_FAQ.map(item => {
          const open = openQ === item.q;
          return (
            <li key={item.q} className="bg-white rounded-2xl border" style={{ borderColor: 'var(--hero-border)' }}>
              <button
                type="button"
                onClick={() => setOpenQ(open ? null : item.q)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
              >
                <span className="font-nunito font-bold text-[15px]" style={{ color: 'var(--hero-ink)' }}>{item.q}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--hero-ink)' }} aria-hidden="true" />
              </button>
              {open && <p className="px-5 pb-4 -mt-1 font-nunito-sans text-sm leading-relaxed" style={{ color: 'var(--hero-gray)' }}>{item.a}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
