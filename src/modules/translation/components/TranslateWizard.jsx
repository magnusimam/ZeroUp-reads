import React from 'react';
import { Search, Check, ArrowRight, Loader2, BadgeCheck, RefreshCw } from 'lucide-react';
import BookCoverArt from '../../books/BookCoverArt';
import { LANGUAGE_FLAG } from '../../books/languageFlags';

function StepCard({ number, title, subtitle, state, children, action }) {
  // state: 'active' | 'done' | 'locked'
  const done = state === 'done';
  return (
    <div
      className={`rounded-3xl border bg-white p-5 sm:p-6 transition-opacity ${state === 'locked' ? 'opacity-50' : ''}`}
      style={{ borderColor: state === 'active' ? 'var(--hero-green)' : 'var(--hero-border)', boxShadow: state === 'active' ? '0 10px 30px rgba(47,122,38,0.12)' : 'none' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center font-nunito font-extrabold text-sm shrink-0"
            style={done
              ? { background: 'var(--hero-green)', color: 'white' }
              : { background: state === 'active' ? 'rgba(47,122,38,0.12)' : '#F1F1F1', color: state === 'active' ? 'var(--hero-green)' : 'var(--hero-gray)' }}
            aria-hidden="true"
          >
            {done ? <Check size={18} strokeWidth={3} /> : number}
          </span>
          <div>
            <h3 className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>{title}</h3>
            {subtitle && <p className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {state !== 'locked' && children}
    </div>
  );
}

export default function TranslateWizard({ page }) {
  const {
    query, setQuery, visibleBooks, hasMoreBooks, showMoreBooks,
    book, chooseBook, changeBook,
    languages, language, chooseLanguage, humanTranslations,
    firstPage, preview, step, startReading,
  } = page;

  return (
    <section id="translate-start" className="scroll-mt-24 flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl" style={{ color: 'var(--hero-ink)' }}>Translate a story in 3 steps</h2>
        <p className="font-nunito-sans text-sm sm:text-base mt-1" style={{ color: 'var(--hero-gray)' }}>Pick a book, pick a language, and see the first page before you start.</p>
      </div>

      {/* ── Step 1: story ───────────────────────────── */}
      <StepCard
        number={1}
        title="Pick a story"
        subtitle={book ? `${book.title} · ${book.language}` : 'Search or choose from our most-read books.'}
        state={step === 1 ? 'active' : 'done'}
        action={book && (
          <button type="button" onClick={changeBook} className="font-nunito font-bold text-sm hover:underline shrink-0" style={{ color: 'var(--hero-orange)' }}>
            Change
          </button>
        )}
      >
        {!book && (
          <>
            <label className="flex items-center gap-2 bg-white rounded-full border px-4 h-11 mb-4 max-w-md" style={{ borderColor: 'var(--hero-border)' }}>
              <Search size={17} style={{ color: 'var(--hero-gray)' }} aria-hidden="true" />
              <span className="sr-only">Search stories</span>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, topic or language…"
                className="flex-1 bg-transparent text-sm font-nunito-sans focus:outline-none"
                style={{ color: 'var(--hero-ink)' }}
              />
            </label>

            {visibleBooks.length === 0 ? (
              <p className="font-nunito-sans text-sm py-6 text-center" style={{ color: 'var(--hero-gray)' }}>No stories match that — try another word.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {visibleBooks.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => chooseBook(b)}
                    className="group text-left rounded-2xl overflow-hidden border bg-white hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(16,40,90,0.12)] transition"
                    style={{ borderColor: 'var(--hero-border)' }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <BookCoverArt category={b.category} coverUrl={b.coverUrl} alt="" style={{ position: 'absolute', inset: 0 }} />
                    </div>
                    <div className="p-3">
                      <p className="font-nunito font-extrabold text-[13px] leading-snug overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]" style={{ color: 'var(--hero-ink)' }}>{b.title}</p>
                      <p className="font-nunito-sans text-xs mt-0.5" style={{ color: 'var(--hero-gray)' }}>{b.category} · {b.language}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {hasMoreBooks && (
              <div className="text-center mt-4">
                <button type="button" onClick={showMoreBooks} className="px-5 py-2 rounded-full border bg-white font-nunito font-bold text-sm" style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}>
                  Show more stories
                </button>
              </div>
            )}
          </>
        )}
      </StepCard>

      {/* ── Step 2: language ────────────────────────── */}
      <StepCard
        number={2}
        title="Pick your language"
        subtitle={language ? `Reading in ${language.name}` : 'Which language should we translate it into?'}
        state={step === 1 ? 'locked' : step === 2 ? 'active' : 'done'}
      >
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Translate into">
          {languages.map(lang => {
            const selected = language?.code === lang.code;
            const human = Boolean(humanTranslations[lang.name]);
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => chooseLanguage(lang.code)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-nunito font-bold text-sm transition"
                style={selected
                  ? { background: 'var(--hero-green)', borderColor: 'var(--hero-green)', color: 'white' }
                  : { background: 'white', borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
              >
                <span aria-hidden="true">{LANGUAGE_FLAG[lang.name] || '🌍'}</span>
                {lang.name}
                {human && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full" style={selected ? { background: 'rgba(255,255,255,0.25)' } : { background: 'rgba(47,122,38,0.12)', color: 'var(--hero-green)' }}>
                    <BadgeCheck size={11} /> By our team
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </StepCard>

      {/* ── Step 3: preview ─────────────────────────── */}
      <StepCard
        number={3}
        title="Preview & start reading"
        subtitle={language ? `Here's the first page in ${language.name}.` : 'See the first page before you start.'}
        state={step === 3 ? 'active' : 'locked'}
      >
        {book && language && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{ background: '#F7F7F4' }}>
                <p className="font-nunito font-extrabold text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--hero-gray)' }}>Original · {book.language}</p>
                <p className="notranslate font-nunito-sans text-[15px] leading-relaxed" style={{ color: 'var(--hero-ink)' }}>{firstPage}</p>
              </div>
              <div className="rounded-2xl p-4 border-2" style={{ borderColor: 'rgba(47,122,38,0.25)', background: 'rgba(47,122,38,0.04)' }}>
                <p className="font-nunito font-extrabold text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: 'var(--hero-green)' }}>
                  {preview.status === 'human' ? <><BadgeCheck size={13} /> {language.name} · translated by our team</> : <>{language.name} · machine translation</>}
                </p>
                {preview.status === 'loading' && (
                  <p className="flex items-center gap-2 font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>
                    <Loader2 size={16} className="animate-spin" /> Translating…
                  </p>
                )}
                {preview.status === 'error' && (
                  <p className="flex items-center gap-2 font-nunito-sans text-sm" style={{ color: 'var(--coral, #E5323B)' }}>
                    <RefreshCw size={15} /> Couldn't reach the translator just now. Check your connection — you can still start reading and we'll try again page by page.
                  </p>
                )}
                {(preview.status === 'done' || preview.status === 'human') && (
                  <p className="notranslate font-nunito-sans text-[15px] leading-relaxed" lang={language.code} style={{ color: 'var(--hero-ink)' }}>{preview.text}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                type="button"
                onClick={startReading}
                className="inline-flex items-center gap-2 px-7 h-12 rounded-full text-white font-nunito font-extrabold text-[15px] shadow-[0_8px_20px_rgba(242,106,27,0.30)] hover:scale-[1.03] transition"
                style={{ background: 'var(--hero-orange)' }}
              >
                Start reading in {language.name} <ArrowRight size={18} />
              </button>
              <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>
                You can tap "Show original" on any page while reading.
              </p>
            </div>
          </>
        )}
      </StepCard>
    </section>
  );
}
