import React, { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight, X } from 'lucide-react';

// Presentational FAQ panel — useHelpCenter decides which items are visible.
export default function FAQAccordion({ items, hiddenCount, showAll, onToggleShowAll, filterLabel, onClearFilter }) {
  const [openQ, setOpenQ] = useState(null);

  // Close whatever was open when the list itself changes (new search/topic).
  useEffect(() => { setOpenQ(null); }, [items]);

  const canToggle = hiddenCount > 0 || showAll;

  return (
    <section
      id="help-faq"
      className="rounded-3xl border border-[#E6ECF5] p-4 sm:p-5 scroll-mt-24"
      style={{ background: '#F6FAFD' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4 px-1">
        <div className="flex items-start gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-nunito font-black text-2xl shrink-0"
            style={{ background: '#F7931E' }}
            aria-hidden="true"
          >?</span>
          <div>
            <h2 className="font-nunito font-extrabold text-lg sm:text-xl" style={{ color: '#0B3FAE' }}>Frequently Asked Questions</h2>
            <p className="font-nunito-sans text-sm" style={{ color: '#1F2A44' }}>Find quick answers to common questions.</p>
          </div>
        </div>
        {canToggle && (
          <button
            type="button"
            onClick={onToggleShowAll}
            className="flex items-center gap-1 font-nunito font-extrabold text-xs hover:underline whitespace-nowrap mt-2"
            style={{ color: '#0B1F4D' }}
          >
            {showAll ? 'Show less' : 'View all FAQ'} <ArrowRight size={14} />
          </button>
        )}
      </div>

      {filterLabel && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="font-nunito-sans text-xs" style={{ color: '#4A5568' }}>Showing:</span>
          <button
            type="button"
            onClick={onClearFilter}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#DCE4F2] font-nunito font-bold text-xs hover:border-[#0B3FAE]"
            style={{ color: '#0B3FAE' }}
            aria-label={`Clear filter: ${filterLabel}`}
          >
            {filterLabel} <X size={12} />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="bg-white rounded-xl border border-[#E6ECF5] px-4 py-6 text-center font-nunito-sans text-sm" style={{ color: '#4A5568' }}>
          No answers match that yet — try other words, or contact our team on the right.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map(item => {
            const open = openQ === item.q;
            return (
              <li key={item.q} className="bg-white rounded-xl border border-[#E6ECF5] shadow-[0_1px_4px_rgba(16,40,90,0.04)]">
                <button
                  type="button"
                  onClick={() => setOpenQ(open ? null : item.q)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 text-left px-4 py-3"
                >
                  <span className="font-nunito-sans font-semibold text-[13px] sm:text-sm" style={{ color: '#0B1F4D' }}>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    style={{ color: '#0B1F4D' }}
                    aria-hidden="true"
                  />
                </button>
                {open && (
                  <p className="px-4 pb-4 -mt-1 font-nunito-sans text-[13px] leading-relaxed" style={{ color: '#4A5568' }}>{item.a}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
