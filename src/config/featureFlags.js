// Minimal feature-flag system (Feature Flags principle): a named, centralized
// place to toggle a feature for a user without a code change/redeploy, instead
// of a feature just always being on for everyone the moment it ships.
// Backed by a plain object for now; swap the object for a config service call
// once flags need to be admin-editable or per-cohort.
const FLAGS = {
  bookTranslation: true,
};

export function isFeatureEnabled(flagName) {
  return Boolean(FLAGS[flagName]);
}
