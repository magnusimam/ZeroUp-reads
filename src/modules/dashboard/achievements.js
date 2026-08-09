import { ACHIEVEMENT_RULES, BOOKS_PER_READER_LEVEL } from '../../config/rules';

// Pure function so it's trivially testable and reusable outside React —
// takes the same progress shape userService.getProgress() returns and maps
// each configured rule to its achieved/locked state. No fabricated data:
// every badge reflects a real, persisted metric.
export function computeAchievements(progress) {
  return ACHIEVEMENT_RULES.map((rule) => ({
    ...rule,
    achieved: (progress[rule.metric] || 0) >= rule.threshold,
  }));
}

// Reader "Level" shown next to their name in the dashboard top bar — derived
// from real completed-book count via BOOKS_PER_READER_LEVEL (config/rules.js)
// rather than a separate, independently-tracked stat that could drift from
// booksCompleted.
export function computeReaderLevel(progress) {
  return 1 + Math.floor((progress.booksCompleted || 0) / BOOKS_PER_READER_LEVEL);
}
