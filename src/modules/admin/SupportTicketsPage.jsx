import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import * as helpService from '../help/helpService';

const TYPE_LABELS = {
  contact: 'Contact',
  problem: 'Problem',
  suggestion: 'Suggestion',
  feedback: 'Feedback',
};

const TYPE_BADGE = {
  contact: 'bg-sky-100 text-sky-700',
  problem: 'bg-red-100 text-red-600',
  suggestion: 'bg-amber-100 text-amber-700',
  feedback: 'bg-teal-100 text-teal-700',
};

function ticketSummary(ticket) {
  if (ticket.type === 'contact') return ticket.subject;
  if (ticket.type === 'problem') return `${ticket.category}${ticket.bookTitle ? ` — ${ticket.bookTitle}` : ''}`;
  if (ticket.type === 'suggestion') return `${ticket.bookTitle}${ticket.bookAuthor ? ` by ${ticket.bookAuthor}` : ''}`;
  if (ticket.type === 'feedback') return `${ticket.rating}★ rating`;
  return '';
}

// Minimal read-only queue so the 4 reader-facing Help Center forms aren't a
// black hole once submitted — matches AdminCMSPage's table styling.
export default function SupportTicketsPage() {
  const [tickets] = useState(() => helpService.getTickets());

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Everything submitted through the Help Center.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              All Tickets
              <span className="ml-2 text-sm font-normal text-slate-400">({tickets.length} total)</span>
            </h2>
          </div>

          {tickets.length === 0 ? (
            <p className="px-6 py-10 text-sm text-slate-400 text-center">No tickets submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[ticket.type]}`}>
                          {TYPE_LABELS[ticket.type]}
                        </span>
                        <span className="text-xs text-slate-400">#{ticket.id.slice(-6)}</span>
                      </div>
                      <p className="font-medium text-sm text-slate-900 truncate">{ticketSummary(ticket)}</p>
                      {(ticket.message || ticket.description || ticket.reason || ticket.comments) && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {ticket.message || ticket.description || ticket.reason || ticket.comments}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(ticket.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
