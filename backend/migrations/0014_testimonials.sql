-- Testimonials (blueprint §6) — deliberately deferred out of the Stage 2
-- core schema (see 0001_initial_schema.sql's header) until this feature's
-- own stage. Read-only content today, same as the frontend's
-- MOCK_TESTIMONIALS: no create/update/delete route exists, so this table is
-- just the seeded source of truth GET /testimonials reads from.
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  quote TEXT NOT NULL,
  -- Nullable + SET NULL, not CASCADE: a testimonial should survive the book
  -- it references being deleted, same as it would just lose its "View
  -- Details" link on the frontend rather than vanish.
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mirrors src/utils/mockData.js's MOCK_TESTIMONIALS field-for-field.
INSERT INTO testimonials (id, name, role, quote, book_id) VALUES
  ('t1', 'Mrs. Gable', 'Primary Educator', 'My class asks for Anansi by name now — that never happened with a worksheet.', '1'),
  ('t2', 'Mr. Osei', 'Parent of two', 'The Baobab story got my daughter asking questions about her own grandmother''s stories.', '5'),
  ('t3', 'Ms. Adeyemi', 'Literacy Coach', 'Zola''s Star Map is the first ''science'' book my reluctant readers finish in one sitting.', '7');

