import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── CONTINUE READING BANNER ─────────────────────────────── */
// `books` is the caller's real in-progress list (HomePage merges each book
// with its persisted currentPage/totalPages) — this component just renders it.
export default function ContinueReadingBanner({ user, books }) {
  const navigate = useNavigate();

  return (
    <section style={{
      background: 'linear-gradient(135deg, #E8A020 0%, #F5A623 100%)',
      padding: '32px 0',
      animation: 'slideDown 400ms ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--navy)', margin: '0 0 4px' }}>
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p style={{ margin: 0, color: 'var(--navy)', fontSize: 16, opacity: 0.8, fontFamily: 'Nunito Sans' }}>Ready to keep reading?</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {books.map(book => (
            <button key={book.id} onClick={() => navigate(`/read/${book.id}`)} style={{
              background: 'rgba(31,61,110,0.12)', border: '2px solid rgba(31,61,110,0.2)',
              borderRadius: 12, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              transition: 'all 200ms ease',
              minHeight: 64,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(31,61,110,0.22)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,61,110,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ fontSize: 28 }}>📖</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: 'var(--navy)', maxWidth: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
                <div style={{ fontFamily: 'Nunito Sans', fontSize: 12, color: 'rgba(31,61,110,0.7)' }}>Page {book.currentPage} of {book.totalPages}</div>
              </div>
            </button>
          ))}
        </div>
        <Link to="/library" style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--navy)',
          textDecoration: 'none', borderBottom: '2px solid var(--navy)', paddingBottom: 2,
          whiteSpace: 'nowrap',
        }}>See all your books →</Link>
      </div>
    </section>
  );
}
