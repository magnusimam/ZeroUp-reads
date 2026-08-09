import React from 'react';
import { Link } from 'react-router-dom';
import BookCoverArt from '../../books/BookCoverArt';

export default function RecentlyReadSection({ books }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--hero-border)', borderRadius: 20, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--hero-ink)' }}>Recently Read</h2>
        <Link to="/profile#completed" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--hero-orange)', textDecoration: 'none' }}>See all</Link>
      </div>

      {books.length === 0 ? (
        <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>
          Finish a story to see it here.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {books.map((book) => (
            <Link key={book.id} to={`/read/${book.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <BookCoverArt category={book.category} style={{ position: 'relative' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--hero-ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{book.title}</p>
                <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 12, color: 'var(--hero-gray)' }}>
                  {book.category} · {book.level}
                </p>
              </div>
              <span style={{ color: 'var(--hero-gray)', fontSize: 14 }} aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
