import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryTileTheme, getTileColorClasses } from '../../books/categoryTheme';
import DownloadButton from './DownloadButton';

// Flat cover-forward tile for the Downloads page — same visual language as
// the Library page's BookCard "tile" variant, but with a download/remove
// icon action in the corner instead of a "View Details" button, since
// saving-for-offline (not reading the detail page) is the point here.
export default function DownloadBookCard({ book }) {
  const navigate = useNavigate();
  const theme = getCategoryTileTheme(book.category);
  const cls = getTileColorClasses(book.category);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-black/5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all">
      <div
        className={`relative aspect-[4/3] flex items-center justify-center cursor-pointer overflow-hidden ${book.coverUrl ? '' : cls.block}`}
        onClick={() => navigate(`/book/${book.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.id}`)}
        aria-label={`View details for ${book.title}`}
      >
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={`${book.title} cover`} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-90 drop-shadow" aria-hidden="true">{theme.icon}</span>
        )}
        <span className={`absolute top-2 left-2 ${cls.chip} text-[11px] font-nunito font-extrabold px-2.5 py-1 rounded-full`}>
          {book.category}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3
          className="font-nunito font-bold text-[13px] sm:text-sm text-charcoal leading-snug cursor-pointer hover:underline overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]"
          onClick={() => navigate(`/book/${book.id}`)}
        >
          {book.title}
        </h3>
        <p className="text-[12px] text-charcoal/50 font-nunito-sans">
          {book.language}{book.ageGroup ? ` · ${book.ageGroup}` : ''}
        </p>

        <div className="flex items-center justify-between mt-1">
          {book.rating ? (
            <span className="flex items-center gap-1 text-xs font-nunito font-bold text-charcoal/70">
              <span className="text-amber" aria-hidden="true">★</span>{book.rating.toFixed(1)}
            </span>
          ) : <span />}
          <DownloadButton book={book} variant="icon" />
        </div>
      </div>
    </div>
  );
}
