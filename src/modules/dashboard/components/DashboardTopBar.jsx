import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAvatarColor } from '../../../utils/avatarColor';

const DEFAULT_AVATAR_URL = '/images/reader-avatar-default.jpg';

// `notifications` is undefined/empty when realNotificationsApi isn't wired
// up (flag off, signed out, or the fetch failed) — in that case `count` is
// still the old "books in progress" stand-in and the dropdown shows the
// original single sentence, so the bell degrades to exactly its previous
// behavior instead of showing an empty list.
function NotificationBell({ notifications, count, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const hasRealNotifications = Boolean(notifications && notifications.length > 0);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        style={{
          width: 40, height: 40, borderRadius: 12, position: 'relative',
          border: '1.5px solid var(--hero-border)', background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 999,
            background: 'var(--hero-orange)', color: 'white', fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito',
            padding: '0 4px', border: '2px solid white',
          }}>{count}</span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '120%', background: 'white', width: 300,
            borderRadius: 14, boxShadow: '0 8px 32px rgba(58,26,16,0.15)', padding: 14, zIndex: 100,
          }}>
            {hasRealNotifications ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: 'var(--hero-ink)' }}>Notifications</span>
                  {count > 0 && (
                    <button
                      onClick={() => onMarkAllRead?.()}
                      style={{ background: 'none', border: 'none', color: 'var(--hero-orange)', fontFamily: 'Nunito Sans', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: 999, marginTop: 5, flexShrink: 0,
                        background: n.isRead ? 'transparent' : 'var(--hero-orange)',
                      }} />
                      <div>
                        <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--hero-ink)' }}>{n.title}</p>
                        <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 12, color: 'var(--hero-gray)' }}>{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>
                {count > 0
                  ? `You have ${count} ${count === 1 ? 'story' : 'stories'} in progress — pick one up!`
                  : "You're all caught up. 🎉"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AccountMenu({ user, readerLevel }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const initial = user.name ? user.name[0].toUpperCase() : 'U';
  const bg = getAvatarColor(user.name);
  const firstName = (user.name || 'Reader').split(' ')[0];
  const avatarUrl = user.avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: bg, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>
          {avatarUrl ? (
            <img
              src={avatarUrl} alt={`${firstName}'s avatar`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : initial}
        </div>
        <span style={{ textAlign: 'left' }} className="hidden-mobile-account">
          <span style={{ display: 'block', fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--hero-ink)' }}>{firstName}</span>
          <span style={{ display: 'block', fontFamily: 'Nunito Sans', fontSize: 11, color: 'var(--hero-gray)' }}>Level {readerLevel}</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--hero-gray)' }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '120%', background: 'white', minWidth: 180,
            borderRadius: 12, boxShadow: '0 8px 32px rgba(58,26,16,0.15)', overflow: 'hidden', zIndex: 100,
          }}>
            <Link to="/profile" onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 16px', color: 'var(--hero-ink)', textDecoration: 'none', fontSize: 14, fontFamily: 'Nunito Sans' }}>👤 My Profile</Link>
            <Link to="/settings" onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 16px', color: 'var(--hero-ink)', textDecoration: 'none', fontSize: 14, fontFamily: 'Nunito Sans' }}>⚙️ Settings</Link>
            <button
              onClick={() => { logout(); setOpen(false); navigate('/'); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', color: 'var(--hero-orange)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Nunito Sans', borderTop: '1px solid #f0f0f0' }}
            >🚪 Log out</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardTopBar({ search, onSearchChange, preferredLanguage, user, notifications, notificationCount, onMarkAllNotificationsRead, readerLevel }) {
  const newStoryLink = preferredLanguage
    ? `/library?language=${encodeURIComponent(preferredLanguage)}`
    : '/library';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{
        flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 10,
        background: 'white', border: '1.5px solid var(--hero-border)',
        borderRadius: 999, padding: '12px 18px',
      }}>
        <span aria-hidden="true" style={{ color: 'var(--hero-gray)' }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stories, topics or lessons..."
          aria-label="Search stories, topics or lessons"
          style={{
            border: 'none', outline: 'none', flex: 1, fontFamily: 'Nunito Sans',
            fontSize: 15, color: 'var(--hero-ink)', background: 'transparent',
          }}
        />
      </div>

      <Link to={newStoryLink} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--hero-orange)', color: 'white',
        borderRadius: 999, padding: '12px 20px', textDecoration: 'none',
        fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap',
      }}>＋ New Story</Link>

      <NotificationBell notifications={notifications} count={notificationCount} onMarkAllRead={onMarkAllNotificationsRead} />
      <AccountMenu user={user} readerLevel={readerLevel} />
    </div>
  );
}
