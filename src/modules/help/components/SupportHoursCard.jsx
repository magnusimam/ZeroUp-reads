import React from 'react';
import { Clock3 } from 'lucide-react';
import { SUPPORT_HOURS } from '../helpConfig';

export default function SupportHoursCard() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#E3EEFA] min-h-[110px] flex items-center"
      style={{ background: '#ECF5FE' }}
    >
      <div className="relative z-10 px-5 py-4 max-w-[60%]">
        <h2 className="flex items-center gap-2 font-nunito font-extrabold text-base" style={{ color: '#0B1F4D' }}>
          <Clock3 size={22} fill="#0B3FAE" color="#fff" aria-hidden="true" /> Support Hours
        </h2>
        <p className="font-nunito-sans text-[13px] mt-2" style={{ color: '#4A5568' }}>We're available {SUPPORT_HOURS.days}</p>
        <p className="font-nunito font-extrabold text-sm" style={{ color: '#0B1F4D' }}>{SUPPORT_HOURS.time}</p>
      </div>

      {/* Girl-with-laptop + "Real People. Real Support." note, from the design mockup. */}
      <img
        src="/images/help/help-support-hours-girl.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-y-0 right-0 h-full w-auto max-w-[40%] sm:max-w-[55%] object-cover object-right"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
        }}
      />
    </section>
  );
}
