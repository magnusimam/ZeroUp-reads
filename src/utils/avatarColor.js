// Shared so a reader's avatar colour is the same in the Navbar dropdown and
// the Reader Dashboard sidebar instead of two components picking their own
// (Modular Architecture — one implementation, not a per-screen copy).
const PALETTE = ['#2F7A26', '#2D6BE4', '#E5533D', '#E8A020', '#3DBE8A'];

export function getAvatarColor(name) {
  if (!name) return PALETTE[0];
  return PALETTE[name.charCodeAt(0) % PALETTE.length];
}
