import React from 'react';
import { WifiOff, Library, TabletSmartphone, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: WifiOff, bg: '#FFE9E4', color: '#F25C3B', label: 'Read Offline', desc: 'Anytime, anywhere' },
  { icon: Library, bg: '#E3F6EC', color: '#2F9E5B', label: 'Save for Later', desc: 'Build your library' },
  { icon: TabletSmartphone, bg: '#E6F0FF', color: '#1466E6', label: 'On Any Device', desc: 'Phone, tablet or computer' },
  { icon: ShieldCheck, bg: '#E3F6EC', color: '#05A75B', label: 'No Data Needed', desc: 'Keep learning always' },
];

// The boy-with-tablet scene (incl. the "Good stories go everywhere!" note,
// the bird and the DOWNLOAD/READ/LEARN/ANYWHERE signpost) is one illustration
// cropped from the approved design mockup; its left edge is masked so it
// melts into the hero's light background behind the copy.
export default function DownloadsHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F3F8F1 0%, #FAFCF7 100%)' }}
    >
      <img
        src="/images/downloads/downloads-hero-boy.jpg"
        alt="A smiling boy reading on a tablet under a tree, beside a signpost reading Download, Read, Learn, Anywhere"
        className="absolute inset-y-0 right-0 h-full w-full md:w-[62%] object-cover opacity-30 md:opacity-100"
        style={{
          objectPosition: 'right center',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
        }}
      />

      <div className="relative max-w-content mx-auto w-full px-4 sm:px-6 py-10 md:py-0 md:h-[280px] flex items-center">
        <div className="max-w-xl">
          <h1 className="flex items-center gap-3 font-nunito font-extrabold text-4xl sm:text-[44px] leading-none">
            <span className="text-4xl sm:text-[42px]" aria-hidden="true">📖</span>
            <span style={{ color: '#0B1F4D' }}>My</span>
            <span style={{ color: '#F26A1B' }}>Downloads</span>
          </h1>
          <p className="font-nunito-sans mt-3 text-[15px]" style={{ color: '#3B4660' }}>
            Read your favourite books anytime, even without an internet connection.
          </p>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 mt-6">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex flex-col items-start gap-1.5">
                  <span
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(16,40,90,0.10)] ring-4 ring-white"
                    style={{ background: f.bg, color: f.color }}
                    aria-hidden="true"
                  >
                    <Icon size={24} strokeWidth={2.2} />
                  </span>
                  <p className="font-nunito font-extrabold text-[13px] mt-1" style={{ color: '#0B1F4D' }}>{f.label}</p>
                  <p className="font-nunito-sans text-xs -mt-1" style={{ color: '#4A5568' }}>{f.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
