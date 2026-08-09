import { DASHBOARD_TOP_GENRES_COUNT } from '../../config/rules';
import { getCategoryAccent } from './dashboardConfig';

// Pure geometry/aggregation for the "Top Genres" donut — takes the category
// of every book a reader has in progress or completed (real reading history,
// not a fabricated demo split) and tallies it into percentage slices, same
// "pure function extracted from the render body" pattern as
// src/modules/analytics/pieChart.js (Separation of Concerns).
export function computeGenreBreakdown(categories) {
  if (categories.length === 0) return [];

  const counts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, DASHBOARD_TOP_GENRES_COUNT);
  const rest = ranked.slice(DASHBOARD_TOP_GENRES_COUNT);
  const restTotal = rest.reduce((sum, [, count]) => sum + count, 0);

  const slices = top.map(([category, count]) => ({ label: category, count, color: getCategoryAccent(category) }));
  if (restTotal > 0) slices.push({ label: 'Others', count: restTotal, color: '#B7AC97' });

  const total = categories.length;
  return slices.map((slice) => ({ ...slice, percent: Math.round((slice.count / total) * 100) }));
}

// Same conic-gradient-segment math as analytics/pieChart.js's
// computePieGradient, generalised to this module's `{ color, percent }`
// slice shape instead of that page's `{ level, value }` shape (their inputs
// differ enough — admin reading-level stats vs. a reader's own genre mix —
// that sharing one function would mean one of the two importing the other's
// domain-specific field names).
export function computeGenreGradient(slices) {
  let previous = 0;
  const segments = slices.map((slice) => {
    const start = previous;
    const end = start + slice.percent;
    previous = end;
    return `${slice.color} ${start}% ${end}%`;
  });
  return `conic-gradient(${segments.join(', ')})`;
}
