import React from 'react';
import { WifiOff, Library, Smartphone, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: WifiOff, bg: '#FFE9E4', color: '#FF6B6B', label: 'Read Offline', desc: 'Anytime, anywhere' },
  { icon: Library, bg: '#E7F9EF', color: '#2F7A26', label: 'Save for Later', desc: 'Build your library' },
  { icon: Smartphone, bg: '#E8F2FF', color: '#2D6BE4', label: 'On Any Device', desc: 'Phone, tablet or computer' },
  { icon: ShieldCheck, bg: '#E7F9EF', color: '#2F7A26', label: 'No Data Needed', desc: 'Keep learning always' },
];

// Reuses the Library page's hero photo — no dedicated "downloads" illustration
// has been supplied yet, and this keeps the same reading-under-the-tree scene
// as a stand-in rather than a mismatched placeholder.
export default function DownloadsHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[300px] sm:h-[340px] lg:h-[380px]">
        <img
          src="/images/library-hero-reading.jpg"
          alt="A child reading under a tree beside a friendly robot, with a village in the distance"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '62% center' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 36%, rgba(255,255,255,0) 62%)' }}
          aria-hidden="true"
        />

        <div
          className="hidden sm:block absolute left-[36%] top-6 font-handwriting text-xl sm:text-2xl leading-tight"
          style={{ color: 'var(--navy)', transform: 'rotate(-6deg)' }}
          aria-hidden="true"
        >
          Good stories<br />go everywhere! <span style={{ color: 'var(--coral, #FF6B6B)' }}>♥</span>
        </div>

        {/* Wooden-sign flourish, standing in for the reference's carved plank
            stack — CSS bars rather than a supplied illustration asset. */}
        <div className="hidden md:flex flex-col gap-1.5 absolute right-4 lg:right-8 top-1/2 -translate-y-1/2">
          {['DOWNLOAD', 'READ', 'LEARN', 'ANYWHERE'].map(word => (
            <span
              key={word}
              className="font-nunito font-extrabold text-xs lg:text-sm text-center px-3 py-1.5 rounded shadow"
              style={{ background: '#8A5A2F', color: '#FFF3E0', letterSpacing: '0.04em' }}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-content mx-auto w-full px-4 sm:px-6">
            <div className="max-w-lg">
              <h1 className="flex items-center gap-2 font-nunito font-extrabold text-4xl sm:text-5xl drop-shadow-sm">
                <span aria-hidden="true">📥</span>
                <span style={{ color: 'var(--navy)' }}>My</span>{' '}
                <span style={{ color: 'var(--hero-orange)' }}>Downloads</span>
              </h1>
              <p className="font-nunito-sans mt-3 text-base drop-shadow-sm" style={{ color: 'var(--hero-gray)' }}>
                Read your favourite books anytime, even without an internet connection.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 max-w-xl">
                {FEATURES.map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="bg-white/90 backdrop-blur rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 shadow-card">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: f.bg, color: f.color }}
                        aria-hidden="true"
                      >
                        <Icon size={18} />
                      </span>
                      <p className="font-nunito font-extrabold text-xs" style={{ color: 'var(--hero-ink)' }}>{f.label}</p>
                      <p className="font-nunito-sans text-[11px]" style={{ color: 'var(--hero-gray)' }}>{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
