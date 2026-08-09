import React, { useState } from 'react';
import { FAQ_ITEMS } from '../helpConfig';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-white rounded-3xl shadow-card divide-y divide-gold/15 overflow-hidden">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-7 py-4 sm:py-5 hover:bg-cream/60 transition-colors"
            >
              <span className="font-nunito font-bold text-sm sm:text-base text-charcoal">
                {item.q}
              </span>
              <span
                className={`shrink-0 text-coral text-lg transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {open && (
              <div className="px-5 sm:px-7 pb-5 sm:pb-6 -mt-1">
                <p className="text-charcoal/60 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
