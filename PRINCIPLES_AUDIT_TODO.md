# ZeroUp Reads — Principles Audit To-Do (2026-08-03)

Fresh audit of the **current working tree** against `CLAUDE.md` / `ENGINEERING_PRINCIPLES_TRACKER.md` / `docs/`. Verified by direct inspection (not just trusting the tracker's own claims): grepped for `MOCK_*` leaks, `alert()` calls, `eventBus.emit` usage, read `config/rules.js`, `config/featureFlags.js`, `App.js`, `ProfilePage.jsx`, `.env.example`, `wrangler.toml`, `public/_redirects`.

**Bottom line:** the tracker's "all 10 ✅ Done" claim holds up under spot-checking — I found no contradicting evidence. One real gap: **none of this is committed yet.**

---

## 🔴 Do first — not a principle, but blocks everything else

- [ ] **Commit the reorg.** `git status` shows the entire modular restructure (`src/modules/*`, `src/config/*`, `src/services/*`, deleted `AuthContext.js`/`utils/auth.js`/old page copies, new IaC files) as uncommitted working-tree changes. Every "✅ Done" below describes what's on disk right now, not what's in git history. Until this lands in a commit, it's one `git checkout --` away from disappearing.
- [ ] Tracker doesn't mention the 6 new static pages (`AboutPage`, `OnboardingPage`, `OfflinePage`, `NotFoundPage`, `PrivacyPage`, `TermsPage`, all in `src/pages/`, 16 lines each, wired into `App.js`). They're trivial placeholders so nothing's broken, but per the tracker's own "living document" rule, add a line noting they exist and are intentionally outside `modules/` (app-shell-style pages, same exception as `Navbar`/`Footer`).

---

## Principle-by-principle

### 1. Separation of Concerns — ✅ mostly, one nit
- [x] `HomePage.jsx` split into `src/components/home/*` (432 lines, down from 1,154).
- [x] `LibraryPage.jsx`, `AdminCMSPage.jsx`, `AnalyticsPage.jsx` all delegate logic to hooks/pure functions (`useLibraryFilters`, `useBookUpload`, `pieChart.js`).
- [ ] **Minor:** `src/pages/ProfilePage.jsx:28-29` computes `bookmarkedBooks`/`completedBooks` via inline `.filter()` in the render body. Small, but it's the same class of thing (deriving data in-component) the tracker extracted elsewhere (e.g. pie-chart math). Low priority — extract to a `useProfileData()` hook only if this page grows.

### 2. Domain-Driven Design — ✅ Done
- [x] `src/modules/{auth,books,library,reading,admin,analytics}/` exist, each with its own service/page/hooks.
- [x] No duplicate `BookCard` — single copy at `modules/books/BookCard.jsx`.
- [ ] **Open (deliberately deferred, matches tracker):** `ProfilePage.jsx` and `userService.js` stay outside `modules/` since "Users" isn't one of the six built-out domains yet. Fine per blueprint §5, but worth remembering next time Users work happens.

### 3. Modular Architecture — ✅ Done
- [x] Single auth implementation (`modules/auth/authService.js`) — old dual `AuthContext.js`/`utils/auth.js` split is deleted in working tree.
- [x] Admin and Library both read/write through `booksService.js` — no separate local catalogues.

### 4. API-First Design — ✅ Done
- [x] Grepped `src/` for `MOCK_` — only appears in `mockData.js` and the 4 service files that seed from it (`booksService`, `statsService`, `userService`, `testimonialsService`). No page imports mock data directly.

### 5. Observability by Default — ✅ Done
- [x] Grepped for `alert(` — zero matches anywhere in `src/`.
- [x] `src/utils/logger.js` auto-subscribes to the event bus; `ErrorBoundary.jsx` wraps `App.js`.
- [ ] **Still open (known/deferred):** no real error-tracking sink (Sentry) — console only. Correctly deferred, no backend/users yet.

### 6. Infrastructure as Code — ✅ Done
- [x] `.env.example`, `.github/workflows/build.yml`, `wrangler.toml`, `public/_redirects` all present and consistent with each other (Cloudflare Pages target, no leaked secrets in `REACT_APP_*`).
- [ ] **Still open (account-level, expected):** Cloudflare Pages project not actually connected; `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets not set — deploy step in `build.yml` is gated to skip until they exist.

### 7. Event-Driven Architecture — ✅ Done
- [x] Verified `eventBus.emit(...)` calls exist in `booksService.js` (`book.uploaded`, `book.deleted`, `translation.completed`), `authService.js` (`user.registered`, `user.login.success/failed`), `bookmarksService.js` (`book.bookmarked`), `ReadingPage.jsx` (`book.completed`) — matches `docs/ENGINEERING_BLUEPRINT.md` §13 event names.
- [x] Real subscribers exist beyond logging: `userService.js` and `statsService.js` both react to events instead of one handler doing everything inline.

### 8. Schema-Driven Design — ✅ Done
- [x] `attributes: {}` bag present on book schema, actually used for `theme` (storybooks) rather than adding new top-level fields.
- [x] `BOOK_CATEGORIES`/`BOOK_LANGUAGES` are single exported taxonomies, re-exported (not copied) where reused.

### 9. Feature Flags — ✅ Done
- [x] `src/config/featureFlags.js` → `isFeatureEnabled('bookTranslation')`, consumed by `AdminCMSPage.jsx`. Confirmed by direct read.

### 10. Rules Engine — ✅ Done
- [x] `src/config/rules.js` → `WORDS_PER_PAGE = 300`, imported and used in `booksService.js`'s page-count calc (not buried inline). Confirmed by direct read.
- [ ] **Still open (deferred, matches tracker):** not admin-editable yet — needs a real admin CMS first.

---

## Net new punch list (things the tracker doesn't already track)

1. [ ] Commit the working-tree reorg (see 🔴 above) — highest priority, everything else is moot if this is lost.
2. [ ] Add a line to `ENGINEERING_PRINCIPLES_TRACKER.md` covering the 6 new static pages and their intentional placement outside `modules/`.
3. [ ] (Optional, low priority) Extract `ProfilePage.jsx`'s two inline `.filter()` calls into a small hook if the page grows further.

Everything else the tracker lists as deferred (real backend, Sentry, admin-editable rules/flags, Cloudflare secrets, additional domain modules for Languages/Translation/Audio/etc.) is still correctly deferred — no action needed until those features actually get built.
