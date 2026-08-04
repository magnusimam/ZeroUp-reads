import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCoverArt from './BookCoverArt';

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

function StarRating({ rating }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Nunito Sans' }}>
      <span style={{ color: 'var(--gold)' }}>★</span>
      <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{rating?.toFixed(1)}</span>
    </span>
  );
}

export default function BookCard({ book, compact = false, variant = 'light', bottomBadge = null, ctaLabel = 'Read Now' }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(book.bookmarked || false);

  const lang = (book.language || '').toLowerCase();
  const level = (book.level || '').toLowerCase();
  const isLuxury = variant === 'luxury';

  if (variant === 'portrait') {
    return (
      <div
        className="book-card-portrait"
        onClick={() => navigate(`/read/${book.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/read/${book.id}`)}
        aria-label={`Read ${book.title}`}
        style={{
          position: 'relative',
          aspectRatio: '3 / 4',
          borderRadius: 18,
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          transition: 'border-color 250ms ease, box-shadow 250ms ease, transform 250ms ease',
        }}
      >
        <BookCoverArt category={book.category} className="absolute-fill" style={{ position: 'absolute', inset: 0 }} />

        {/* Age-group / category badge */}
        {book.ageGroup && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(10,10,15,0.55)', border: '1px solid rgba(212,175,55,0.5)',
            color: 'var(--gold)', fontSize: 11, fontWeight: 700, fontFamily: 'Nunito',
            borderRadius: 99, padding: '4px 12px', letterSpacing: '0.03em',
            backdropFilter: 'blur(4px)',
          }}>{book.ageGroup}</span>
        )}

        {/* Bottom info panel */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '16px 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {bottomBadge && (
            <span style={{
              alignSelf: 'center', marginBottom: 4,
              background: 'var(--gold)', color: 'var(--ink)',
              fontSize: 11, fontWeight: 800, fontFamily: 'Cinzel, serif',
              letterSpacing: '0.08em', borderRadius: 99, padding: '5px 16px',
              boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
            }}>{bottomBadge}</span>
          )}
          <h3 style={{
            fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'white',
            margin: 0, overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.25,
          }}>{book.title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito Sans' }}>
            {book.author}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
            {book.rating ? <StarRating rating={book.rating} /> : <span />}
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/read/${book.id}`); }}
            style={{
              marginTop: 4, width: '100%', background: 'var(--gold)', color: 'var(--ink)',
              border: 'none', borderRadius: 10, padding: '9px 0',
              fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{ctaLabel}</button>
        </div>

        <style>{`
          .book-card-portrait:hover {
            border-color: var(--gold) !important;
            box-shadow: 0 0 0 1px rgba(212,175,55,0.4), 0 16px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.25) !important;
            transform: translateY(-4px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={isLuxury ? 'book-card-luxury' : 'book-card'}
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
          color: isLuxury ? 'var(--cream)' : 'var(--charcoal)', margin: '0 0 4px',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          transition: 'color 200ms ease',
        }}>{book.title}</h3>
        <p style={{ fontSize: 14, color: isLuxury ? 'rgba(255,248,237,0.55)' : '#888', margin: '0 0 10px', fontFamily: 'Nunito Sans' }}>
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
            <div style={{ fontSize: 12, color: isLuxury ? 'rgba(255,248,237,0.5)' : '#888', marginBottom: 4, fontFamily: 'Nunito Sans' }}>
              Page {book.currentPage} of {book.totalPages}
            </div>
            <div style={{ height: 4, background: isLuxury ? 'rgba(255,255,255,0.12)' : '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
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
