import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil, BookOpen, Bookmark, FileText, Flame } from 'lucide-react';
import { getAvatarColor } from '../../../utils/avatarColor';

const STATS = [
  { key: 'booksCompleted', icon: BookOpen, bg: '#E8F2FF', color: 'var(--sky-blue, #2D6BE4)', label: 'Books completed' },
  { key: 'bookmarks', icon: Bookmark, bg: '#FFE9E4', color: 'var(--hero-orange)', label: 'Bookmarks' },
  { key: 'pagesRead', icon: FileText, bg: '#E8F2FF', color: 'var(--sky-blue, #2D6BE4)', label: 'Pages read' },
  { key: 'streak', icon: Flame, bg: '#FFE9E4', color: 'var(--hero-orange)', label: 'Day reading streak' },
];

export default function ProfileCard({ user, progress, bookmarkCount }) {
  const navigate = useNavigate();
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const values = { booksCompleted: progress.booksCompleted || 0, bookmarks: bookmarkCount, pagesRead: progress.pagesRead || 0, streak: progress.streak || 0 };

  return (
    <div className="relative z-10 max-w-content mx-auto w-full px-4 sm:px-6 -mt-10 sm:-mt-14">
      <div className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center text-white text-2xl font-nunito font-extrabold"
                style={{ background: getAvatarColor(user.name) }}
              >
                {initial}
              </div>
              <button
                type="button"
                title="Change photo (coming soon)"
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-card"
                style={{ background: 'var(--sky-blue, #2D6BE4)' }}
              >
                <Camera size={12} />
              </button>
            </div>

            <div>
              <h2 className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>{user.name}</h2>
              <p className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>{user.email}</p>
              {user.role && (
                <span
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-nunito font-bold"
                  style={{ background: '#E8F2FF', color: 'var(--sky-blue, #2D6BE4)' }}
                >
                  {user.role}
                  <Pencil size={10} />
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border font-nunito font-bold text-sm shrink-0"
            style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
          >
            <Pencil size={14} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t" style={{ borderColor: 'var(--hero-border)' }}>
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="font-nunito font-extrabold text-lg leading-none" style={{ color: 'var(--hero-ink)' }}>{values[s.key]}</p>
                  <p className="font-nunito-sans text-[11px] mt-1 truncate" style={{ color: 'var(--hero-gray)' }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
