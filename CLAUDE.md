# ZeroUp Reads — Engineering Rules

This project follows the **10 Scalable Engineering Principles** adapted from Afrizonemart 2.0's engineering doc. Full definitions, current audit status, and action items live in [`ENGINEERING_PRINCIPLES_TRACKER.md`](./ENGINEERING_PRINCIPLES_TRACKER.md) — read it before doing structural work here.

## Product & architecture reference docs

`docs/` holds the source product and architecture documents this codebase is being built toward — read them before proposing new features, domains, or data shapes, not just when doing structural refactors:

- [`docs/ZEROUP_READS_CONCEPT.md`](./docs/ZEROUP_READS_CONCEPT.md) — the product concept/strategy doc: mission, vision, target content domains (finance, science, health, tech, folklore, history, agriculture, civics), reading-level tiers, distribution strategy, business model, and roadmap. Use this to sanity-check that a feature actually serves the product (e.g. reading levels, categories, languages should trace back to this doc, not be invented ad hoc).
- [`docs/ENGINEERING_BLUEPRINT.md`](./docs/ENGINEERING_BLUEPRINT.md) — the target system architecture: domains, database blueprint, AI/publishing/reading/translation workflows, event names, suggested stack, and eventual monorepo folder structure. This repo today is the `apps/web` slice of that blueprint, on mock data.
- [`docs/SCALABLE_ARCHITECTURE_PRINCIPLES.md`](./docs/SCALABLE_ARCHITECTURE_PRINCIPLES.md) — the same 10 principles below, restated with ZeroUp-Reads-specific domain examples (books, languages, translation, audio, reading, search). Confirms the Afrizonemart-adapted tracker isn't drifting from the project's own source doc.

When these product docs and the tracker's audit findings conflict (e.g. a domain name, a reading-level definition), the product docs in `docs/` are the source of truth for *what* to build; the tracker is the source of truth for *how well the current code matches it*.

## Default rule for all future work in this repo

Before adding or changing code, check it against these 10 principles. In priority order for this codebase right now:

1. **Separation of Concerns** — never mix business logic (filtering, validation, calculations) into page/component JSX. Extract to hooks or plain functions.
2. **Domain-Driven Design** — organize by business domain, in `src/modules/{auth,books,library,reading,admin,analytics}/`, not generic technical buckets. Add a new module folder for a domain (Languages, Translation, Audio, Users, CMS, ...) as that feature actually gets built, following `docs/ENGINEERING_BLUEPRINT.md` §5's full domain list. Don't duplicate a component (e.g. `BookCard`) across files.
3. **Modular Architecture** — a module (auth, books, admin) is a single source of truth. Don't let two parts of the app maintain separate copies of the same data (this already happened once: `AuthContext.js` vs `utils/auth.js`; `AdminCMSPage`'s local book state vs `LibraryPage`'s — both fixed by routing through one service per domain).
4. **API-First Design** — route data access through a service layer (`src/modules/<domain>/*Service.js` for domain services, `src/services/*` for cross-cutting ones like `userService`), even while it's backed by mock data/localStorage, so swapping in a real backend later doesn't touch call sites.
5. **Observability by Default** — log meaningful actions (auth, uploads, completions, errors) via `src/utils/logger.js`'s event-bus subscription; don't let a bare `alert()` or silent failure be the only signal.
6. **Infrastructure as Code** — once a backend/deploy target exists, its config is committed, not clicked together. Don't commit build output (`build/`) as source.
7. **Event-Driven Architecture** — when one action should trigger several independent effects (e.g. book completion → streak update → analytics), emit through `src/utils/eventBus.js` and have each effect subscribe independently, not one handler doing everything inline.
8. **Schema-Driven Design** — keep data shapes consistent across the files that create vs. consume them (e.g. book `category`); use the `attributes: {}` bag on the book schema for new optional/extensible fields rather than adding another top-level core field.
9. **Feature Flags** and **10. Rules Engine** — don't hardcode values that are actually business rules (pagination size, words-per-page, sort logic) as bare constants buried in a component — put them in `src/config/rules.js` / `src/config/featureFlags.js` (`isFeatureEnabled`), even before they're admin-editable.

## Working agreement

- When a change touches one of the violations already logged in the tracker, fix it as part of that change rather than adding to the pile, when reasonably in scope.
- When the tracker's status table changes (a principle moves from ❌/⚠️ to ✅, or a new violation is found), update `ENGINEERING_PRINCIPLES_TRACKER.md` in the same change.
- This file and the tracker are the default frame for evaluating *any* future feature or refactor in this repo — not just the ones explicitly named above.
