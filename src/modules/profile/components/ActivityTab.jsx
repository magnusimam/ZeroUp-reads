import React from 'react';
import ReadingProgressChart from '../../dashboard/components/ReadingProgressChart';
import TopGenresChart from '../../dashboard/components/TopGenresChart';

// Reuses the Reader Dashboard's own charts (same weeklyActivity/genreBreakdown
// data useDashboardData already computes) rather than a second copy of this
// same chart logic living under Profile.
export default function ActivityTab({ weeklyActivity, genreBreakdown }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <ReadingProgressChart weeklyActivity={weeklyActivity} />
      <TopGenresChart genreBreakdown={genreBreakdown} />
    </div>
  );
}
