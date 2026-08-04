// Pure geometry math for the reading-level distribution pie chart — extracted
// out of AnalyticsPage's render body so it's unit-testable without rendering
// anything (Separation of Concerns).

export function computeTotal(byLevel) {
  return byLevel.reduce((sum, level) => sum + level.value, 0);
}

export function computePieGradient(byLevel, colorHexMap) {
  const total = computeTotal(byLevel);
  const { segments } = byLevel.reduce(
    (acc, level) => {
      const start = acc.previous;
      const end = start + (level.value / total) * 100;
      acc.segments.push(`${colorHexMap[level.level]} ${start}% ${end}%`);
      acc.previous = end;
      return acc;
    },
    { segments: [], previous: 0 }
  );
  return `conic-gradient(${segments.join(', ')})`;
}
