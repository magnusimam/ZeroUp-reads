import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCoverArt from './BookCoverArt';
import DownloadButton from '../reading/components/DownloadButton';
import { getCategoryTileTheme, getTileColorClasses } from './categoryTheme';

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

export default function BookCard({ book, compact = false, variant = 'light', bottomBadge = null, ctaLabel = 'View Details', shelf = false, onTranslateRequest = null, showCta = false, badge = null }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(book.bookmarked || false);

  const lang = (book.language || '').toLowerCase();
  const level = (book.level || '').toLowerCase();
  const isLuxury = variant === 'luxury';

  // Flat, colorful card — Library's "Featured Books" side cards and the
  // "All Books" grid. A different visual language from the dark illustrated
  // `portrait`/default variants above (matches the bright reference design
  // those don't), so it's its own branch rather than a reskin of either.
  if (variant === 'tile') {
    const theme = getCategoryTileTheme(book.category);
    const cls = getTileColorClasses(book.category);

    // A real cover photo already has the title, age range and tagline
    // baked into the artwork — showing it small (cropped to a landscape
    // strip) with a second, plain text block underneath just hid it.
    // Let the cover fill the whole card instead, book-jacket style.
    if (book.coverUrl) {
      return (
        <div
          className="relative rounded-2xl overflow-hidden bg-white border border-black/5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all cursor-pointer aspect-[3/4]"
          onClick={() => navigate(`/book/${book.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.id}`)}
          aria-label={`View details for ${book.title}`}
        >
          <img src={book.coverUrl} alt={`${book.title} cover`} className="absolute inset-0 w-full h-full object-cover" />

          {badge && (
            <span className={`absolute top-2 left-2 ${cls.chip} text-[11px] font-nunito font-extrabold px-2.5 py-1 rounded-full shadow`}>
              {badge}
            </span>
          )}
          {onTranslateRequest && (
            <button
              onClick={e => { e.stopPropagation(); onTranslateRequest(book); }}
              aria-label={`Request a translation of ${book.title}`}
              title="Request a translation"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs shadow"
            >🌍</button>
          )}
          {book.rating && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 text-[11px] font-nunito font-bold text-charcoal px-2 py-1 rounded-full shadow">
              <span className="text-amber" aria-hidden="true">★</span>{book.rating.toFixed(1)}
            </span>
          )}
          {showCta && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/book/${book.id}`); }}
              className={`absolute bottom-2 left-2 right-2 text-white text-xs font-nunito font-bold rounded-full py-2 transition-colors shadow ${cls.btn}`}
            >{ctaLabel}</button>
          )}
        </div>
      );
    }

    return (
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-black/5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all cursor-pointer"
        onClick={() => navigate(`/book/${book.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.id}`)}
        aria-label={`View details for ${book.title}`}
      >
        <div className={`relative ${cls.block} aspect-[4/3] flex items-center justify-center overflow-hidden`}>
          <span className="text-4xl opacity-90 drop-shadow" aria-hidden="true">{theme.icon}</span>
          <span className={`absolute top-2 left-2 ${cls.chip} text-[11px] font-nunito font-extrabold px-2.5 py-1 rounded-full`}>
            {badge || book.category}
          </span>
          {onTranslateRequest && (
            <button
              onClick={e => { e.stopPropagation(); onTranslateRequest(book); }}
              aria-label={`Request a translation of ${book.title}`}
              title="Request a translation"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs"
            >🌍</button>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1 flex-1">
          <h3 className="font-nunito font-bold text-[13px] sm:text-sm text-charcoal leading-snug overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {book.title}
          </h3>
          <p className="text-[12px] text-charcoal/50 font-nunito-sans">
            {book.language}{book.ageGroup ? ` · ${book.ageGroup}` : ''}
          </p>
          {book.rating && (
            <div className="flex items-center gap-1 mt-auto pt-1">
              <span className="text-amber text-xs" aria-hidden="true">★</span>
              <span className="text-xs font-nunito font-bold text-charcoal/70">{book.rating.toFixed(1)}</span>
            </div>
          )}
          {showCta && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/book/${book.id}`); }}
              className={`mt-2 w-full text-white text-xs font-nunito font-bold rounded-full py-2 transition-colors ${cls.btn}`}
            >{ctaLabel}</button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'portrait') {
    return (
      <div
        className="book-card-portrait"
        onClick={() => navigate(`/book/${book.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.id}`)}
        aria-label={`View details for ${book.title}`}
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
        {book.coverUrl ? (
          <>
            <img
              src={book.coverUrl} alt=""
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Vignette so the bottom title/author stay legible over a photo cover
                — BookCoverArt bakes this in itself; a real photo needs it added back. */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(0deg, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.15) 45%, rgba(10,10,15,0) 65%)',
            }} />
          </>
        ) : (
          <BookCoverArt category={book.category} className="absolute-fill" style={{ position: 'absolute', inset: 0 }} />
        )}

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

        {/* Translate request (reader-facing; queued for admin approval) */}
        {onTranslateRequest && (
          <button
            onClick={e => { e.stopPropagation(); onTranslateRequest(book); }}
            aria-label={`Request a translation of ${book.title}`}
            title="Request a translation"
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(10,10,15,0.55)', border: '1px solid rgba(212,175,55,0.5)',
              color: 'var(--gold)', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito',
              borderRadius: 99, padding: '4px 10px', letterSpacing: '0.02em',
              backdropFilter: 'blur(4px)', cursor: 'pointer',
            }}
          >🌍 Translate</button>
        )}

        <div style={{ position: 'absolute', top: onTranslateRequest ? 52 : 12, right: 12 }}>
          <DownloadButton book={book} variant="icon" />
        </div>

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
            onClick={e => { e.stopPropagation(); navigate(`/book/${book.id}`); }}
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
      className={`${isLuxury ? 'book-card-luxury' : 'book-card'} ${shelf ? 'shelf-book' : ''}`}
      onClick={() => navigate(`/book/${book.id}`)}
      style={{ position: 'relative', userSelect: 'none' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.id}`)}
      aria-label={`View details for ${book.title}`}
    >
      {/* Cover */}
      <div className={shelf ? 'shelf-book-cover' : ''} style={{ position: 'relative' }}>
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

        {/* Offline download toggle — replaces the old unwired `book.saved`
            placeholder badge with the real per-device download state. */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <DownloadButton book={book} variant="icon" />
        </div>
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
          {onTranslateRequest && (
            <button
              onClick={e => { e.stopPropagation(); onTranslateRequest(book); }}
              aria-label={`Request a translation of ${book.title}`}
              title="Request a translation"
              style={{
                background: isLuxury ? 'rgba(212,175,55,0.15)' : 'rgba(31,61,110,0.08)',
                color: isLuxury ? 'var(--gold)' : 'var(--navy)',
                border: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito',
                borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
              }}
            >🌍 Translate</button>
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
