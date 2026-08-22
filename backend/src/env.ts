export interface Env {
  ENVIRONMENT: string;
  DB: D1Database;
  JWT_SECRET: string;
  // Google OAuth (auth/oauthGoogle.ts) — placeholders until a real OAuth
  // client is registered; see backend/README.md's OAuth section. Same
  // deferred-until-owner posture as JWT_SECRET/the D1 database.
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  OAUTH_REDIRECT_BASE_URL: string;
  OAUTH_FRONTEND_REDIRECT_URL: string;
}
