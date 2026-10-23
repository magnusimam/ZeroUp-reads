import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, ChevronRight, BookOpen, Download, UserRound, Users, Bookmark } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

function Card({ title, icon, action, children }) {
  return (
    <div className="bg-white rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: 'var(--hero-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-nunito font-extrabold text-[15px]" style={{ color: 'var(--hero-ink)' }}>
          <span aria-hidden="true">{icon}</span> {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ReadingProgressCard({ progress, currentTier, nextBookAchievement, booksToNextAchievement }) {
  const navigate = useNavigate();
  const target = nextBookAchievement?.threshold || Math.max(progress.booksCompleted || 0, 1);
  const pct = Math.min(100, Math.round(((progress.booksCompleted || 0) / target) * 100));
  const circumference = 2 * Math.PI * 42;

  return (
    <Card title="My Reading Progress" icon="📊" action={
      <Link to="/library" className="text-xs font-nunito font-bold" style={{ color: 'var(--sky-blue, #2D6BE4)' }}><ChevronRight size={16} /></Link>
    }>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#EAF2FF" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="var(--sky-blue, #2D6BE4)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>{progress.booksCompleted || 0}</span>
            <span className="text-[10px] font-nunito-sans" style={{ color: 'var(--hero-gray)' }}>Books completed</span>
          </div>
        </div>
        <p className="font-nunito-sans text-sm italic" style={{ color: 'var(--hero-gray)' }}>
          "Every page you read is a step towards a brighter you!" 🌱
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--hero-border)' }}>
        <div>
          <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>Reading Level</p>
          <p className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>{currentTier.label}</p>
        </div>
        <button onClick={() => navigate('/settings')} className="font-nunito font-bold text-xs hover:underline" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>Change</button>
      </div>

      {nextBookAchievement && (
        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: '#E8F2FF' }}>
          <Target size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--sky-blue, #2D6BE4)' }} />
          <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-ink)' }}>
            <span className="font-nunito font-bold">Keep going!</span> Read {booksToNextAchievement} more book{booksToNextAchievement === 1 ? '' : 's'} to unlock "{nextBookAchievement.label}".
          </p>
        </div>
      )}
    </Card>
  );
}

function RecentBooksCard({ books, onSwitchTab }) {
  return (
    <Card title="Recent Books" icon="🕐" action={
      <button onClick={() => onSwitchTab('books')} className="text-xs font-nunito font-bold" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>View all →</button>
    }>
      {books.length === 0 ? (
        <p className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>
          Start a book and it'll show up here so you can jump back in.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {books.slice(0, 3).map(book => {
            const pct = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
            return (
              <Link key={book.id} to={`/read/${book.id}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/5">
                  {book.coverUrl && <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-sm truncate group-hover:underline" style={{ color: 'var(--hero-ink)' }}>{book.title}</p>
                  <p className="font-nunito-sans text-[11px]" style={{ color: 'var(--hero-gray)' }}>{book.language} · {book.totalPages} pages</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--hero-green)' }} />
                    </div>
                    <span className="text-[10px] font-nunito font-bold shrink-0" style={{ color: 'var(--hero-gray)' }}>{pct}%</span>
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0" style={{ color: 'var(--hero-gray)' }} />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AchievementsPreviewCard({ achievements, onSwitchTab }) {
  return (
    <Card title="My Achievements" icon="🏆" action={
      <button onClick={() => onSwitchTab('achievements')} className="text-xs font-nunito font-bold" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>View all →</button>
    }>
      <div className="grid grid-cols-2 gap-3">
        {achievements.slice(0, 4).map(a => (
          <div
            key={a.id}
            className="rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
            style={{ background: a.achieved ? '#FFF3E0' : '#F5F6F8', opacity: a.achieved ? 1 : 0.55 }}
          >
            <span className="text-2xl" aria-hidden="true">{a.icon}</span>
            <p className="font-nunito font-bold text-[11px] leading-tight" style={{ color: 'var(--hero-ink)' }}>{a.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BookmarksPreviewCard({ bookmarkedBooks, onSwitchTab }) {
  return (
    <Card title="My Bookmarks" icon="🔖" action={
      <button onClick={() => onSwitchTab('bookmarks')} className="text-xs font-nunito font-bold" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>View all →</button>
    }>
      {bookmarkedBooks.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-4">
          <Bookmark size={28} style={{ color: 'var(--hero-orange)' }} />
          <p className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>No bookmarks yet</p>
          <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>
            Books you save will show up here so you can find them easily anytime.
          </p>
          <Link to="/library" className="mt-2 px-5 py-2 rounded-full text-white text-xs font-nunito font-bold" style={{ background: 'var(--sky-blue, #2D6BE4)' }}>
            Explore Books →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarkedBooks.slice(0, 3).map(book => (
            <Link key={book.id} to={`/book/${book.id}`} className="flex items-center gap-2 font-nunito-sans text-sm hover:underline" style={{ color: 'var(--hero-ink)' }}>
              <Bookmark size={13} style={{ color: 'var(--hero-orange)' }} /> <span className="truncate">{book.title}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

const PREFERENCE_ROWS = (settings, currentTier, onboardingPrefs) => [
  { label: 'Language', value: settings.preferredLanguage || 'Not set' },
  { label: 'Age Group', value: `${currentTier.label} (${currentTier.ageRange})` },
  { label: 'Reading Level', value: onboardingPrefs.level || 'Not set' },
  { label: 'Notifications', value: settings.notificationsEnabled !== false ? 'On' : 'Off' },
];

function PreferencesCard({ settings, currentTier, onboardingPrefs }) {
  const navigate = useNavigate();
  const rows = PREFERENCE_ROWS(settings, currentTier, onboardingPrefs);
  return (
    <Card title="My Preferences" icon="⚙️" action={
      <button onClick={() => navigate('/settings')} className="text-xs font-nunito font-bold" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>Edit →</button>
    }>
      <div className="flex flex-col divide-y" style={{ borderColor: 'var(--hero-border)' }}>
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
            <span className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>{row.label}</span>
            <span className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  const toast = useToast();

  async function inviteFriend() {
    const url = window.location.origin;
    if (navigator.share) {
      try { await navigator.share({ title: 'ZeroUp Reads', text: 'Come read with me on ZeroUp Reads!', url }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast?.addToast('Invite link copied to clipboard!', 'success');
    } catch {
      toast?.addToast(url, 'info');
    }
  }

  const ACTIONS = [
    { label: 'Explore New Books', icon: BookOpen, bg: '#E7F9EF', color: 'var(--hero-green)', to: '/library' },
    { label: 'Download for Offline Reading', icon: Download, bg: '#E8F2FF', color: 'var(--sky-blue, #2D6BE4)', to: '/offline' },
    { label: 'Update Profile', icon: UserRound, bg: '#FFE9E4', color: 'var(--hero-orange)', to: '/settings' },
    { label: 'Invite a Friend', icon: Users, bg: '#F1E9FF', color: '#6C5FBC', onClick: inviteFriend },
  ];

  return (
    <Card title="Quick Actions" icon="⚡">
      <div className="flex flex-col gap-2.5">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          const content = (
            <>
              <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: a.bg, color: a.color }}>
                <Icon size={16} />
              </span>
              <span className="font-nunito font-bold text-sm" style={{ color: a.color }}>{a.label}</span>
            </>
          );
          return a.to ? (
            <Link key={a.label} to={a.to} className="flex items-center gap-3 rounded-xl p-2.5 hover:opacity-80 transition-opacity" style={{ background: a.bg }}>
              {content}
            </Link>
          ) : (
            <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 rounded-xl p-2.5 hover:opacity-80 transition-opacity text-left" style={{ background: a.bg }}>
              {content}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function OverviewTab({
  progress, currentTier, nextBookAchievement, booksToNextAchievement,
  continueReadingBooks, achievements, bookmarkedBooks, settings, onboardingPrefs,
  onSwitchTab,
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      <ReadingProgressCard progress={progress} currentTier={currentTier} nextBookAchievement={nextBookAchievement} booksToNextAchievement={booksToNextAchievement} />
      <RecentBooksCard books={continueReadingBooks} onSwitchTab={onSwitchTab} />
      <AchievementsPreviewCard achievements={achievements} onSwitchTab={onSwitchTab} />
      <BookmarksPreviewCard bookmarkedBooks={bookmarkedBooks} onSwitchTab={onSwitchTab} />
      <PreferencesCard settings={settings} currentTier={currentTier} onboardingPrefs={onboardingPrefs} />
      <QuickActionsCard />
    </div>
  );
}
