import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryTileTheme, getTileColorClasses } from '../../books/categoryTheme';
import DownloadButton from './DownloadButton';

// Full-bleed cover card for the Downloads page: the cover fills the card and
// the title/meta/rating sit on a dark fade at the bottom, with the
// download/remove action as a white disc in the corner. `featured` is the
// larger "Recommended" card in the Popular Downloads row.
export default function DownloadBookCard({ book, featured = false }) {
  const navigate = useNavigate();
  const theme = getCategoryTileTheme(book.category);
  const cls = getTileColorClasses(book.category);
  const open = () => navigate(`/book/${book.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={e => e.key === 'Enter' && e.target === e.currentTarget && open()}
      aria-label={`View details for ${book.title}`}
      className={`group relative w-full overflow-hidden cursor-pointer transition-all hover:-translate-y-1 ${
        featured
          ? 'aspect-[188/228] rounded-2xl ring-4 ring-white shadow-[0_14px_30px_rgba(16,40,90,0.28)]'
          : 'aspect-[175/206] rounded-2xl shadow-[0_8px_20px_rgba(16,40,90,0.16)]'
      } ${book.coverUrl ? 'bg-[#0B1F4D]' : cls.block}`}
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 flex items-start justify-center pt-8 text-5xl drop-shadow" aria-hidden="true">{theme.icon}</span>
      )}

      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.30) 58%, rgba(0,0,0,0.78) 100%)' }}
        aria-hidden="true"
      />

      <span className={`absolute top-2.5 left-2.5 ${cls.block} text-white text-[10px] font-nunito font-extrabold px-2.5 py-0.5 rounded-full shadow-sm`}>
        {book.category}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col">
        {featured && (
          <span
            className="self-center mb-2 text-[10px] font-nunito font-black tracking-wide px-3 py-0.5 rounded-full shadow"
            style={{ background: '#FFC928', color: '#3B2600' }}
          >
            RECOMMENDED
          </span>
        )}
        <h3 className={`font-nunito font-extrabold text-white leading-snug drop-shadow overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] ${featured ? 'text-sm' : 'text-[13px]'}`}>
          {book.title}
        </h3>
        <p className="text-[11px] text-white/85 font-nunito-sans mt-1">
          {book.language}{book.ageGroup ? ` • ${book.ageGroup}` : ''}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          {book.rating ? (
            <span className="flex items-center gap-1 text-xs font-nunito font-bold text-white">
              <span className="text-[15px]" style={{ color: '#FFC928' }} aria-hidden="true">★</span>{book.rating.toFixed(1)}
            </span>
          ) : <span />}
          <DownloadButton book={book} variant="icon-light" />
        </div>
      </div>
    </div>
  );
}
