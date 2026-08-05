// Content pipeline steps for the homepage's "How ZeroUp Reads Works" strip —
// distinct from the reader-onboarding flow (register → browse → read) this
// used to show; this one explains where a book on the shelf actually comes
// from, matching the product's AI/publishing workflow in
// docs/ENGINEERING_BLUEPRINT.md.
export const HOW_IT_WORKS_STEPS = [
  { key: 'create', icon: 'lightbulb', bg: 'var(--amber)', label: 'We create or find amazing books' },
  { key: 'translate', icon: 'languages', bg: 'var(--green)', label: 'We translate into African languages' },
  { key: 'narrate', icon: 'mic', bg: 'var(--sky-blue)', label: 'We add audio & beautiful pictures' },
  { key: 'read', icon: 'laptop', bg: 'var(--coral)', label: 'You read online or offline' },
  { key: 'grow', icon: 'sparkles', bg: '#7C3AED', label: 'Children learn, grow & shine!' },
];
