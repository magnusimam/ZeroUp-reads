import React, { useEffect, useState } from 'react';

const TABS = ['Language', 'Level', 'Sort'];

function ChipOption({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-nunito font-semibold border transition-colors ${
        active
          ? 'bg-gold text-ink border-gold'
          : 'bg-white text-charcoal/70 border-gold/30 hover:border-gold hover:text-cocoa'
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterPanel({
  isOpen, onClose, initialTab = 'Language',
  language, setLanguage, languageOptions,
  level, setLevel, levelOptions,
  sort, setSort, sortOptions,
  onClear,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white border border-gold/25 rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-playfair font-bold text-cocoa text-lg">Sort &amp; Filter</h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="text-charcoal/50 hover:text-cocoa text-xl leading-none"
          >✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gold/15">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-nunito font-semibold border-b-2 transition-colors ${
                activeTab === tab ? 'border-gold text-cocoa' : 'border-transparent text-charcoal/50 hover:text-charcoal/80'
              }`}
            >{tab}</button>
          ))}
        </div>

        {activeTab === 'Language' && (
          <div className="flex flex-wrap gap-2">
            {languageOptions.length === 0 ? (
              <p className="text-charcoal/40 text-sm font-nunito-sans">No languages available yet.</p>
            ) : languageOptions.map(l => (
              <ChipOption
                key={l}
                label={l}
                active={language === l}
                onClick={() => setLanguage(language === l ? null : l)}
              />
            ))}
          </div>
        )}

        {activeTab === 'Level' && (
          <div className="flex flex-wrap gap-2">
            {levelOptions.map(l => (
              <ChipOption
                key={l}
                label={l}
                active={level === l}
                onClick={() => setLevel(level === l ? null : l)}
              />
            ))}
          </div>
        )}

        {activeTab === 'Sort' && (
          <div className="flex flex-col gap-2">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-nunito font-semibold border transition-colors ${
                  sort === opt.value
                    ? 'bg-gold/10 border-gold text-cocoa'
                    : 'bg-transparent border-gold/15 text-charcoal/70 hover:border-gold/40'
                }`}
              >
                {opt.label}
                {sort === opt.value && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-5 border-t border-gold/15">
          <button
            onClick={onClear}
            className="flex-1 py-3 rounded-xl border border-charcoal/15 text-charcoal/70 text-sm font-nunito font-semibold hover:border-gold/40 hover:text-cocoa transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gold text-ink text-sm font-nunito font-bold hover:opacity-90 transition-opacity"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
