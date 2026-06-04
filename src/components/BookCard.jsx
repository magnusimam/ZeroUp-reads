import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const langBadgeStyle = {
  english:  { background: 'var(--navy)',     color: 'white' },
  swahili:  { background: 'var(--green)',    color: 'white' },
  yoruba:   { background: 'var(--amber)',    color: 'var(--navy)' },
  zulu:     { background: 'var(--coral)',    color: 'white' },
  french:   { background: 'var(--sky-blue)', color: 'white' },
};
const levelBadgeStyle = {
  beginner:     { background: 'var(--green)',  color: 'white' },
  intermediate: { background: 'var(--amber)',  color: 'var(--navy)' },
  advanced:     { background: 'var(--coral)',  color: 'white' },
};

// Simple coloured placeholder cover if no image
function CoverPlaceholder({ title, language }) {
  const bgMap = { english: '#1F3D6E', swahili: '#3DBE8A', yoruba: '#E8A020', zulu: '#FF6B6B', french: '#2D6BE4' };
  const bg = bgMap[(language||'').toLowerCase()] || '#1F3D6E';
  return (
    <div style={{
      width: '100%', paddingTop: '56.25%', position: 'relative',
      background: bg, borderRadius: '16px 16px 0 0',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}>
        <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.4 }}>
          {title}
        </span>
      </div>
      <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 28 }}>📖</span>
    </div>
  );
}

export default function BookCard({ book, compact = false }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(book.bookmarked || false);

  const lang = (book.language || '').toLowerCase();
  const level = (book.level || '').toLowerCase();

  return (
    <div
      className="book-card"
      onClick={() => navigate(`/read/${book.id}`)}
      style={{ position: 'relative', userSelect: 'none' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/read/${book.id}`)}
      aria-label={`Read ${book.title}`}
    >
      {/* Cover */}
      <div style={{ position: 'relative' }}>
        {book.coverUrl ? (
          <img
            src={book.coverUrl} alt={book.title}
            style={{
              width: '100%', aspectRatio: '16/9', objectFit: 'cover',
              borderRadius: '16px 16px 0 0', display: 'block',
            }}
          />
        ) : (
          <CoverPlaceholder title={book.title} language={book.language} />
        )}

        {/* Bookmark icon */}
        <button
          onClick={e => { e.stopPropagation(); setBookmarked(b => !b); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'background 200ms ease',
          }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this book'}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
        >
          {bookmarked ? '🔖' : '🏷️'}
        </button>

        {/* Saved badge (offline) */}
        {book.saved && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'var(--green)', color: 'white',
            fontSize: 11, fontWeight: 700, fontFamily: 'Nunito',
            borderRadius: 99, padding: '3px 10px',
          }}>Saved ✓</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: compact ? '12px' : '16px' }}>
        <h3 style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: compact ? 15 : 18,
          color: 'var(--charcoal)', margin: '0 0 4px',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>{book.title}</h3>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 10px', fontFamily: 'Nunito Sans' }}>
          {book.author}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {book.language && (
            <span style={{
              ...(langBadgeStyle[lang] || { background: 'var(--navy)', color: 'white' }),
              fontSize: 12, fontWeight: 700, fontFamily: 'Nunito',
              borderRadius: 99, padding: '3px 10px',
            }}>{book.language}</span>
          )}
          {book.level && (
            <span style={{
              ...(levelBadgeStyle[level] || { background: 'var(--green)', color: 'white' }),
              fontSize: 12, fontWeight: 700, fontFamily: 'Nunito',
              borderRadius: 99, padding: '3px 10px',
            }}>{book.level}</span>
          )}
        </div>

        {/* Progress bar (for in-progress books) */}
        {book.currentPage && book.totalPages && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4, fontFamily: 'Nunito Sans' }}>
              Page {book.currentPage} of {book.totalPages}
            </div>
            <div style={{ height: 4, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--amber)',
                width: `${(book.currentPage / book.totalPages) * 100}%`,
                borderRadius: 99, transition: 'width 300ms ease',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
