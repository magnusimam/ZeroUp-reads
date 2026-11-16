import React from 'react';
import { Lightbulb, Target } from 'lucide-react';
import BookCard from '../../books/BookCard';
import { PARENT_TIPS, TEACHER_TIPS } from '../parentsTeachersConfig';

const LEVEL_LABEL = { Beginner: 'Level 1 · Beginner', Intermediate: 'Level 2 · Intermediate', Advanced: 'Level 3 · Advanced' };

function TipBox({ title, tips, tone }) {
  return (
    <aside className="rounded-3xl p-5 sm:p-6" style={{ background: tone.bg, border: `1px solid ${tone.border}` }}>
      <h3 className="flex items-center gap-2 font-nunito font-extrabold text-base" style={{ color: 'var(--hero-ink)' }}>
        <Lightbulb size={20} style={{ color: tone.accent }} aria-hidden="true" /> {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {tips.map(t => (
          <li key={t} className="flex gap-2 font-nunito-sans text-sm leading-relaxed" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true" style={{ color: tone.accent }}>•</span> {t}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-4 py-2 rounded-full border-2 font-nunito font-bold text-sm transition"
      style={active
        ? { background: 'var(--hero-green)', borderColor: 'var(--hero-green)', color: 'white' }
        : { background: 'white', borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
    >
      {children}
    </button>
  );
}

export function ParentsTab({ shelves }) {
  return (
    <div className="flex flex-col gap-10">
      <p className="font-nunito-sans text-base sm:text-lg max-w-2xl" style={{ color: 'var(--hero-ink)' }}>
        Reading together is one of the best gifts you can give a child. Here are stories picked for reading at home — short, warm and in your language.
      </p>

      {shelves.map(shelf => (
        <section key={shelf.id}>
          <h2 className="font-nunito font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--hero-ink)' }}>{shelf.title}</h2>
          <p className="font-nunito-sans text-sm mt-1 mb-4" style={{ color: 'var(--hero-gray)' }}>{shelf.subtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {shelf.books.map(book => <BookCard key={book.id} book={book} variant="tile" />)}
          </div>
        </section>
      ))}

      <TipBox title="Tips for reading at home" tips={PARENT_TIPS} tone={{ bg: '#FFF6EC', border: '#F8E3C8', accent: 'var(--hero-orange)' }} />
    </div>
  );
}

// What a book teaches: its learning objectives when it has them, otherwise
// its subject + level — so every teacher card carries a usable lesson hook.
function teachesLine(book) {
  const objectives = (book.attributes?.learningObjectives || [])
    .map(o => (typeof o === 'string' ? o : o.title))
    .filter(Boolean);
  return objectives.length ? objectives.slice(0, 3).join(' · ') : book.category;
}

export function TeachersTab({ subjects, subjectId, setSubjectId, levels, level, setLevel, books, onClear }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-nunito-sans text-base sm:text-lg max-w-2xl" style={{ color: 'var(--hero-ink)' }}>
        Storybooks that teach real subjects — science, technology, health, money and more. Filter by subject and reading level to find the right book for your class.
      </p>

      <div className="flex flex-col gap-4 rounded-3xl bg-white border p-5" style={{ borderColor: 'var(--hero-border)' }}>
        <div>
          <p className="font-nunito font-extrabold text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--hero-gray)' }}>Subject</p>
          <div className="flex flex-wrap gap-2 mobile-scroll-row">
            <Chip active={!subjectId} onClick={() => setSubjectId(null)}>All subjects</Chip>
            {subjects.map(s => <Chip key={s.id} active={subjectId === s.id} onClick={() => setSubjectId(s.id)}>{s.label}</Chip>)}
          </div>
        </div>
        <div>
          <p className="font-nunito font-extrabold text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--hero-gray)' }}>Reading level</p>
          <div className="flex flex-wrap gap-2 mobile-scroll-row">
            <Chip active={!level} onClick={() => setLevel(null)}>All levels</Chip>
            {levels.map(l => <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{LEVEL_LABEL[l] || l}</Chip>)}
          </div>
        </div>
      </div>

      <section>
        <p className="font-nunito font-bold text-sm mb-4" style={{ color: 'var(--hero-gray)' }}>
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </p>
        {books.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>No books for that subject and level yet.</p>
            <button type="button" onClick={onClear} className="mt-2 font-nunito font-bold text-sm hover:underline" style={{ color: 'var(--hero-orange)' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {books.map(book => (
              <div key={book.id} className="flex flex-col gap-2">
                <BookCard book={book} variant="tile" />
                <p className="flex items-start gap-1.5 font-nunito-sans text-xs leading-snug px-1" style={{ color: 'var(--hero-gray)' }}>
                  <Target size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--hero-green)' }} aria-hidden="true" />
                  <span><strong style={{ color: 'var(--hero-ink)' }}>Teaches:</strong> {teachesLine(book)} · {book.level}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <TipBox title="Tips for the classroom" tips={TEACHER_TIPS} tone={{ bg: '#EEF8F1', border: '#D3EDDC', accent: 'var(--hero-green)' }} />
    </div>
  );
}
