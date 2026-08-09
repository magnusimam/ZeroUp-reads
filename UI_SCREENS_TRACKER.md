# ZeroUp Reads — UI Screens & Feature Development Tracker

Companion to [`ENGINEERING_PRINCIPLES_TRACKER.md`](./ENGINEERING_PRINCIPLES_TRACKER.md) (the *how well-built* audit) — this file is the *what exists vs. what the product needs* audit, checked against [`docs/ZEROUP_READS_CONCEPT.md`](./docs/ZEROUP_READS_CONCEPT.md) (product scope) and [`docs/ENGINEERING_BLUEPRINT.md`](./docs/ENGINEERING_BLUEPRINT.md) (target architecture, client apps, domains).

**Status legend:** ✅ Live &nbsp;|&nbsp; ⚠️ Partial / stub &nbsp;|&nbsp; ❌ Not started &nbsp;|&nbsp; 🚫 Non-functional placeholder (renders, does nothing)

---

## 1. What kind of product this actually is

This repo (`apps/web` in the blueprint's eventual monorepo) is **one of seven planned client surfaces** for a two-sided platform:

| Client (per blueprint §4) | Status in this repo |
|---|---|
| **Web** (reader-facing) | Being built here — the bulk of what exists |
| **Admin Dashboard** | Partially here (`/admin`, `/admin/analytics`) |
| **CMS** | Folded into Admin Dashboard today, not separate |
| **Translator Portal** | ❌ Does not exist as its own surface — only an admin-side approve/reject queue |
| **Author Portal** | ❌ Does not exist |
| **Android app** | ❌ Out of scope for this repo, but the product's *primary* distribution channel per the concept doc (§6.2, "Android-first") |
| **iOS app** | ❌ Not in roadmap (concept doc doesn't mention iOS at all — Android-first is deliberate given the target market) |

So today's app is really two products wearing one shell: a **children's reading platform** (library, reader, dashboard, profile) and a **lightweight internal content-ops tool** (upload, translate-request approval, usage analytics) for admins. Both are real and both are explicitly in-scope per the docs — but the reader side is far more built out than the content-ops side, and neither has any of the *business-model* or *distribution* screens the concept doc treats as core (print-on-demand, USSD/SMS, offline sync, community/Local Language Champions).

---

## 2. Screens that exist today (grouped by audience)

### Public / marketing
| Screen | Route | Status |
|---|---|---|
| Home | `/` | ✅ Live — hero, discover, popular books, how-it-works, AI-powered, preserving-words, CTA blocks |
| About | `/about` | ✅ Live |
| Privacy Policy | `/privacy` | ✅ Live |
| Terms | `/terms` | ✅ Live |
| 404 Not Found | `*` | ✅ Live |

### Auth / account
| Screen | Route | Status |
|---|---|---|
| Register | `/register` | ✅ Live — role selection (reader/teacher/creator/admin implied), org name field |
| Login | `/login` | ✅ Live |
| Forgot / reset password | — | ❌ Not started — `authService.js` has no `resetPassword`/token flow |
| Email verification | — | ❌ Not started |
| Onboarding (first-run) | `/welcome` | 🚫 Placeholder — "Coming in the next build phase" |

### Reader (authenticated)
| Screen | Route | Status |
|---|---|---|
| Library (browse/filter/sort) | `/library` | ✅ Live — hero, continue reading, best-for-you carousel, story books, educational books, filter panel, testimonials |
| Reading view | `/read/:bookId` | ✅ Live — page turning, bookmarking, progress recording, completion event |
| Reader Dashboard | `/dashboard` | ✅ Live — stats grid, weekly activity chart, genre donut, recently read, continue journey, category explorer, achievements |
| Profile | `/profile` | ✅ Live — bookmarks, completed books, stats |
| Settings | `/settings` | ✅ Live — preferred language, default font size |
| Translate-this-book request | modal on `/library` | ✅ Live — `TranslateRequestModal` + `useTranslateRequest` |
| Search results (dedicated) | — | ❌ Not started — search bars exist (home discover, library, dashboard topbar) but none navigate to a real results/facets page; they filter in-place at best |
| Book detail / product page | — | ❌ Not started — no pre-read page (synopsis, reviews, "available in X languages", related books) between a library card and the reader view |
| Offline / no-connection state | `/offline` | 🚫 Placeholder — "Coming in the next build phase"; manifest.json markets "even offline" but there's no service worker registered anywhere |

### Admin / content-ops (authenticated, `role === 'admin'`)
| Screen | Route | Status |
|---|---|---|
| Admin CMS (upload/delete books, approve/reject translation requests) | `/admin` | ✅ Live |
| Analytics dashboard | `/admin/analytics` | ✅ Live — users, books, reads/completions this week, reads-by-language, level distribution, top books |
| Draft → Review → Approval publishing pipeline | — | ❌ Not started — upload is instantly live; blueprint §8 defines a 9-stage workflow (`Author → Draft → AI Review → Editor → Illustration → Translation → QA → Approval → Publication → Distribution`), today's app implements exactly one stage |
| User / role management | — | ❌ Not started — roles exist on the user record but there's no admin screen to view/change them |
| Content moderation / flagged content | — | ❌ Not started |
| Audit log viewer | — | ❌ Not started — `logger.js` writes structured logs to the console only; nothing surfaces them in UI |

---

## 3. Features you haven't paid attention to yet

Grouped by why they matter, pulling directly from the concept/blueprint docs rather than generic SaaS checklist items:

### Reading experience (blueprint §9, concept §5.1)
- **Audio / text-to-speech.** The concept doc names TTS as core — "enabling audio learning for pre-literate children and communities with oral traditions." There is currently zero audio playback anywhere (no `<audio>` element, no TTS integration, `AudioBooks` isn't in the schema). This is arguably the single highest-leverage missing feature given the target users (pre-literate children, oral-tradition communities).
- **Real offline reading.** `manifest.json`'s own description promises "read anywhere, even offline," but there's no service worker, no cache strategy, no "download for offline" button on a book. `/offline` is a stub. Given Nigeria's connectivity gaps (concept §6.1), this isn't a nice-to-have — it's load-bearing for the target market.
- **A book detail/product page.** Right now a library card goes straight into the reader. There's nowhere to see a synopsis, available languages/translations, age/level badge, ratings, or "also available in Yoruba" before committing to open it.
- **Reviews & ratings.** `Reviews`/`Ratings` are named entities in the blueprint's database (§6) but nothing writes or reads them anywhere in the app.
- **Collections / reading lists.** Named in the blueprint (§6, §11 "Recommended Core Modules") — no "my collections," no curated collections (e.g. "Independence Day picks"), no way to save a list beyond individual bookmarks.
- **Real recommendations.** `BestForYouCarousel` and the dashboard's "Recommended" section both exist, but check whether they're actually personalized (reading history/genre-based) or just slicing the same mock array everyone sees — worth a quick audit the same way the tracker caught `ContinueReadingBanner` fabricating data.

### Roles the product explicitly needs but has no UI for
- **Translator Portal.** Concept §5.2 and blueprint §4 both call this out as a distinct client. Today, "translation" is a single admin-approved queue inside `/admin` — there's no interface for an actual translator to log in, see assigned work, submit a translation, or flag ambiguous terms.
- **Author/Illustrator Portal.** Same gap — content creation is entirely admin-upload today; there's no self-serve author flow matching the blueprint's publishing pipeline.
- **Teacher/Parent view.** Register lets someone pick a "Teacher" role, but nothing differs in the app afterward — no classroom roster, no assigning books to students, no progress-monitoring view for a parent/teacher, despite "Teacher Training" and "Parent and Caregiver Programs" being named distribution-strategy pillars (concept §6.4).
- **Community / Local Language Champion tools.** Concept §6.4 names this as a core distribution channel (recruiting volunteers, running reading circles, serving as a feedback channel). Zero UI surface for it — not even a "become a Local Language Champion" contact form.

### Business model (concept §8) — nothing built yet
- **Order/checkout flow.** `OrderCTA.jsx` on the Library page renders a "Order for your kids 🧸" button with no `onClick` — it's fully decorative. The concept doc's print-on-demand and physical-book-sales revenue streams have no cart, no checkout, no order-status screen.
- **Subscription / premium gating.** The "Freemium Digital Model" (ad-free, full offline library, print-at-home) is a named revenue stream with no pricing page, no plan comparison, no billing screen, no upgrade prompt anywhere.
- **Institutional/licensing flow.** No screen for a school/NGO to request bulk licensing.

### Trust, accessibility, and platform basics
- **Notifications.** No in-app notification center, no email/SMS notification triggers, despite `Notifications` being a named blueprint entity and event names (`translation.completed`, `book.published`) already existing on the event bus that nothing user-facing subscribes to.
- **Help / FAQ / Contact / Support.** No page for a confused parent or a broken-book bug report to go to.
- **UI localization (i18n).** `LibraryHeader.jsx` has a language dropdown, but it's cosmetic — no `onChange`, no actual translated UI strings anywhere. For a product whose entire premise is "read in your own language," the *app chrome itself* is English-only with no counter-plan.
- **Accessibility beyond font size.** `SettingsPage` has a font-size control, but no dyslexia-friendly font option, no high-contrast mode, no screen-reader-specific testing evident — notable given phonics/early-literacy is a core use case.
- **Content-gap / language-coverage analytics.** Concept §5.2 names this as a specific Analytics Dashboard requirement ("tracking readership, language coverage, **content gaps**, and impact metrics"). Today's `/admin/analytics` shows usage stats but nothing about which languages/levels/domains are under-served — the exact metric an org running a content pipeline needs to decide what to commission next.

---

## 4. Development tracker — all UI screens

Priority follows the blueprint's own MVP roadmap (§19: Phase 1 = Library, Auth, Search, CMS; Phase 2 = AI translation, Audio, Offline; Phase 3 = Recommendations, Community, Schools) rather than an invented one.

| # | Screen | Route | Audience | Status | Priority | Notes |
|---|---|---|---|---|---|---|
| 1 | Home | `/` | Public | ✅ Live | — | — |
| 2 | About | `/about` | Public | ✅ Live | — | — |
| 3 | Privacy | `/privacy` | Public | ✅ Live | — | — |
| 4 | Terms | `/terms` | Public | ✅ Live | — | — |
| 5 | 404 | `*` | Public | ✅ Live | — | — |
| 6 | Register | `/register` | Auth | ✅ Live | — | — |
| 7 | Login | `/login` | Auth | ✅ Live | — | — |
| 8 | Forgot/Reset Password | — | Auth | ❌ Not started | P1 | Blocks real user trust; currently no recovery path at all |
| 9 | Email Verification | — | Auth | ❌ Not started | P2 | |
| 10 | Onboarding (first-run) | `/welcome` | Auth | 🚫 Placeholder | P1 | Route + nav entry exist, page is a stub |
| 11 | Library (browse/filter) | `/library` | Reader | ✅ Live | — | — |
| 12 | Book Detail Page | — | Reader | ❌ Not started | P0 | Missing link between card and reader; needed for synopsis/languages/ratings |
| 13 | Reading View | `/read/:bookId` | Reader | ✅ Live | — | No audio narration (see #22) |
| 14 | Search Results Page | — | Reader | ❌ Not started | P0 | Search bars exist in 4 places, none lead anywhere real |
| 15 | Reader Dashboard | `/dashboard` | Reader | ✅ Live | — | — |
| 16 | Profile | `/profile` | Reader | ✅ Live | — | — |
| 17 | Settings | `/settings` | Reader | ✅ Live | — | Add i18n + accessibility options here |
| 18 | Collections / My Lists | — | Reader | ❌ Not started | P2 | Named in blueprint §6/§11 |
| 19 | Reviews & Ratings (write/view) | — | Reader | ❌ Not started | P2 | Named in blueprint §6 |
| 20 | Translate-This-Book Request | modal | Reader | ✅ Live | — | — |
| 21 | Offline / No-Connection | `/offline` | Reader | 🚫 Placeholder | P1 | No service worker exists to make this real |
| 22 | Audio Playback / TTS Controls | in reader | Reader | ❌ Not started | P0 | Core to concept doc's target users (pre-literate, oral-tradition) |
| 23 | Notification Center | — | Reader | ❌ Not started | P2 | Event bus already emits events nothing subscribes to for this |
| 24 | Help / FAQ / Contact | — | Public/Reader | ❌ Not started | P1 | |
| 25 | Pricing / Premium Upgrade | — | Reader | ❌ Not started | P2 | Freemium model named in concept §8, nothing built |
| 26 | Checkout / Order (print-on-demand) | — | Reader | 🚫 Placeholder | P2 | `OrderCTA` button has no handler |
| 27 | Teacher Classroom View | — | Teacher | ❌ Not started | P2 | "Teacher" is a selectable role at registration with no distinct experience after |
| 28 | Parent Progress View | — | Parent | ❌ Not started | P2 | |
| 29 | Local Language Champion / Volunteer Signup | — | Public | ❌ Not started | P2 | Named distribution channel, concept §6.4 |
| 30 | Admin CMS (upload/delete/translation queue) | `/admin` | Admin | ✅ Live | — | — |
| 31 | Publishing Pipeline (draft→review→approve) | — | Admin | ❌ Not started | P1 | Blueprint §8 defines 9 stages; today implements 1 |
| 32 | Translator Portal | — | Translator | ❌ Not started | P1 | Named distinct client in blueprint §4 |
| 33 | Author/Illustrator Portal | — | Author | ❌ Not started | P2 | Named distinct client in blueprint §4 |
| 34 | User & Role Management | — | Admin | ❌ Not started | P1 | Roles exist on user records with no admin UI to manage them |
| 35 | Content Moderation | — | Admin | ❌ Not started | P2 | |
| 36 | Audit Log Viewer | — | Admin | ❌ Not started | P2 | Logs already exist in `logger.js`, just not surfaced |
| 37 | Analytics Dashboard | `/admin/analytics` | Admin | ✅ Live | — | Add language-coverage/content-gap views (see §3 above) |
| 38 | Bulk/Institutional Licensing Request | — | Admin/Public | ❌ Not started | P2 | |

---

## 5. Suggested next-build order

Following the blueprint's own phasing (§19) rather than re-deriving one:

1. **P0 — finish Phase 1 (Library/Auth/Search/CMS):** Book Detail Page, Search Results Page, Audio/TTS in the reader.
2. **P1 — trust & pipeline gaps that block real users:** Forgot Password, real Onboarding, Help/Contact, Publishing Pipeline, User & Role Management, Translator Portal, a real Offline mode.
3. **P2 — Phase 2/3 items (concept §9):** Collections, Reviews, Notifications, Teacher/Parent views, Community/Local Language Champion signup, Pricing/Checkout, Author Portal, Content Moderation, Audit Log Viewer, Institutional Licensing.

Update this table as screens ship — same living-document convention as `ENGINEERING_PRINCIPLES_TRACKER.md`.
