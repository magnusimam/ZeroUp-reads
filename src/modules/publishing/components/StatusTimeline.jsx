import React from 'react';
import { STATUS_ORDER, STATUS_LABELS } from '../publishingConfig';

// Vertical stepper over the fixed pipeline stage order — a "needs_changes"
// submission still shows Submitted/Review as complete (it passed through
// them), it just hasn't reached Approved/Published yet.
export default function StatusTimeline({ status, history }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <ol className="space-y-0">
      {STATUS_ORDER.map((stage, i) => {
        const reached = i <= currentIndex;
        const isCurrent = stage === status;
        const entry = [...history].reverse().find((h) => h.status === stage);
        const isLast = i === STATUS_ORDER.length - 1;

        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isCurrent ? 'bg-teal-600 text-white' : reached ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {reached ? '✓' : i + 1}
              </span>
              {!isLast && <span className={`w-0.5 flex-1 min-h-[24px] ${reached ? 'bg-teal-200' : 'bg-slate-100'}`} />}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-semibold ${reached ? 'text-slate-900' : 'text-slate-400'}`}>
                {STATUS_LABELS[stage]}
              </p>
              {entry && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {entry.byName} · {new Date(entry.at).toLocaleString()}
                  {entry.comment && <span className="block mt-1 text-slate-600 italic">"{entry.comment}"</span>}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
