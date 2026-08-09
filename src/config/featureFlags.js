// Minimal feature-flag system (Feature Flags principle): a named, centralized
// place to toggle a feature for a user without a code change/redeploy, instead
// of a feature just always being on for everyone the moment it ships.
// Backed by a plain object for now; swap the object for a config service call
// once flags need to be admin-editable or per-cohort.
const FLAGS = {
  bookTranslation: true,
  // AI-narrated reading (docs/ZEROUP_READS_CONCEPT.md §5.1's TTS pipeline)
  // isn't built yet (no audio/AI-voice service exists) — BookDetailPage's
  // "Read with AI" button reads this to show a friendly "coming soon" state
  // instead of a dead click, and flips on in one place once it ships.
  bookAIReading: false,
  // Production-ready feature build (see ENGINEERING_PRINCIPLES_TRACKER.md) —
  // each is a real, shipped feature today; kept as flags (not bare code) so
  // any one can be killed instantly without a redeploy if it misbehaves.
  roleManagement: true,
  publishingPipeline: true,
  translationPortal: true,
  offlineReading: true,
};

export function isFeatureEnabled(flagName) {
  return Boolean(FLAGS[flagName]);
}
