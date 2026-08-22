import { Hono } from "hono";
import type { Env } from "../env";

type LanguageRow = { code: string; name: string };

const languages = new Hono<{ Bindings: Env }>();

// Public, like GET /books — the languages table (migrations/0001) already
// exists and is seeded; this is the first thing that actually exposes it.
// Backs AdminCMSPage.jsx's language dropdown (currently the hardcoded
// BOOK_LANGUAGES list) once the frontend is wired up.
languages.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT code, name FROM languages ORDER BY name ASC").all<LanguageRow>();
  return c.json({ languages: results });
});

export default languages;
