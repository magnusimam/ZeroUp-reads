import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCoverArt from '../../books/BookCoverArt';
import { getCategoryAccent } from '../dashboardConfig';
import { isBookmarked, toggleBookmark } from '../../reading/bookmarksService';

// A large, photo-illustrated "in progress" card matching the Reader
// Dashboard's reference design — built from the same shared BookCoverArt
// illustration every other book cover in the app uses (Modular Architecture:
// one illustrated-cover implementation, not a dashboard-only copy), just
// composed with dashboard-specific chrome (description + percent-read bar)
// that BookCard's own variants don't need.
export default function ContinueJourneyCard({ book }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(book.id));
  const percent = Math.round((book.currentPage / book.totalPages) * 100);
  const accent = getCategoryAccent(book.category);

  return (
    <div
      onClick={() => navigate(`/read/${book.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/read/${book.id}`)}
      aria-label={`Continue reading ${book.title}`}
      style={{
        position: 'relative', aspectRatio: '3 / 4', borderRadius: 24,
        overflow: 'hidden', cursor: 'pointer', userSelect: 'none',
      }}
    >
      <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />

      <button
        onClick={(e) => { e.stopPropagation(); setBookmarked(toggleBookmark(book.id).includes(book.id)); }}
        aria-label={bookmarked ? `Remove ${book.title} from favourites` : `Add ${book.title} to favourites`}
        style={{
          position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(10,10,15,0.4)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white',
        }}
      >{bookmarked ? '🔖' : '🏷️'}</button>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 16px 18px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <h3 style={{
          margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'white',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.25,
        }}>{book.title}</h3>

        {book.description && (
          <p style={{
            margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito Sans',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          }}>{book.description}</p>
        )}

        <span style={{
          alignSelf: 'flex-start', background: accent, color: 'white',
          fontSize: 11, fontWeight: 800, fontFamily: 'Nunito', letterSpacing: '0.04em',
          textTransform: 'uppercase', borderRadius: 999, padding: '4px 12px',
        }}>{book.category}</span>

        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'Nunito Sans', marginBottom: 4 }}>
            {percent}% Read
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percent}%`, background: accent, borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
