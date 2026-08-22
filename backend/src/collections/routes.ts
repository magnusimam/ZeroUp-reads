import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, getOptionalUser, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";
import { toApiBook, type BookRow } from "../books/service";
import {
  listVisibleCollections,
  getCollection,
  canView,
  canManage,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionBooks,
  addBookToCollection,
  removeBookFromCollection,
  toApiCollection,
} from "./service";

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  isPublic: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  isPublic: z.boolean().optional(),
});

const addBookSchema = z.object({ bookId: z.string().trim().min(1) });

const collections = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Optional auth — a guest sees only public collections; a signed-in caller
// also sees their own private ones (getOptionalUser never blocks the route).
collections.get("/", async (c) => {
  const user = await getOptionalUser(c);
  const rows = await listVisibleCollections(c.env.DB, user?.sub ?? null);
  return c.json({ collections: rows.map(toApiCollection) });
});

collections.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await getOptionalUser(c);

  const collection = await getCollection(c.env.DB, id);
  // Same 404-not-403 posture as notifications: a private collection a
  // stranger can't see looks identical to one that doesn't exist.
  if (!collection || !canView(collection, user?.sub ?? null, user?.role === ROLES.ADMINISTRATOR)) {
    return c.json({ error: "Collection not found." }, 404);
  }

  const books = await getCollectionBooks(c.env.DB, id);
  return c.json({ collection: toApiCollection(collection), books: (books as BookRow[]).map(toApiBook) });
});

collections.post("/", authMiddleware, zValidator("json", createSchema), async (c) => {
  const authUser = c.get("authUser");
  const body = c.req.valid("json");
  const id = await createCollection(c.env.DB, { ownerId: authUser.sub, ...body });
  const collection = await getCollection(c.env.DB, id);
  return c.json({ collection: toApiCollection(collection!) }, 201);
});

collections.patch("/:id", authMiddleware, zValidator("json", updateSchema), async (c) => {
  const authUser = c.get("authUser");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await getCollection(c.env.DB, id);
  if (!existing || !canManage(existing, authUser.sub, authUser.role === ROLES.ADMINISTRATOR)) {
    return c.json({ error: "Collection not found." }, 404);
  }

  await updateCollection(c.env.DB, id, existing, body);
  const updated = await getCollection(c.env.DB, id);
  return c.json({ collection: toApiCollection(updated!) });
});

collections.delete("/:id", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const id = c.req.param("id");

  const existing = await getCollection(c.env.DB, id);
  if (!existing || !canManage(existing, authUser.sub, authUser.role === ROLES.ADMINISTRATOR)) {
    return c.json({ error: "Collection not found." }, 404);
  }

  await deleteCollection(c.env.DB, id);
  return c.json({ success: true });
});

collections.post("/:id/books", authMiddleware, zValidator("json", addBookSchema), async (c) => {
  const authUser = c.get("authUser");
  const id = c.req.param("id");
  const { bookId } = c.req.valid("json");

  const existing = await getCollection(c.env.DB, id);
  if (!existing || !canManage(existing, authUser.sub, authUser.role === ROLES.ADMINISTRATOR)) {
    return c.json({ error: "Collection not found." }, 404);
  }
  const book = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(bookId).first();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  await addBookToCollection(c.env.DB, id, bookId);
  const books = await getCollectionBooks(c.env.DB, id);
  return c.json({ books: (books as BookRow[]).map(toApiBook) });
});

collections.delete("/:id/books/:bookId", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const id = c.req.param("id");
  const bookId = c.req.param("bookId");

  const existing = await getCollection(c.env.DB, id);
  if (!existing || !canManage(existing, authUser.sub, authUser.role === ROLES.ADMINISTRATOR)) {
    return c.json({ error: "Collection not found." }, 404);
  }

  await removeBookFromCollection(c.env.DB, id, bookId);
  const books = await getCollectionBooks(c.env.DB, id);
  return c.json({ books: (books as BookRow[]).map(toApiBook) });
});

export default collections;
