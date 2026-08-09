import * as eventBus from '../../utils/eventBus';

const TICKETS_KEY = 'zeroup_support_tickets';

function readAll() {
  const raw = localStorage.getItem(TICKETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  return tickets;
}

export function getTickets() {
  return readAll();
}

// `type` is one of 'contact' | 'problem' | 'suggestion' | 'feedback' —
// `fields` carries whatever that type's form collected (SupportForm.jsx owns
// the field set per type, this service just persists whatever it's given).
export function submitTicket(type, fields, submittedBy) {
  const tickets = readAll();
  const ticket = {
    id: String(Date.now()),
    type,
    ...fields,
    submittedBy: submittedBy || null,
    submittedAt: new Date().toISOString(),
  };

  writeAll([ticket, ...tickets]);
  eventBus.emit('support.ticket.submitted', { id: ticket.id, type });
  return ticket;
}
