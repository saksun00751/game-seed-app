/**
 * lib/session/cookies.ts
 *
 * Thin wrappers around Next.js `cookies()` for reading/writing
 * the session token cookie (HTTP-only, Secure, SameSite=Lax).
 */

import { cookies } from "next/headers";

export const SESSION_COOKIE = "lotto_sid";

const MAX_AGE = Number(process.env.SESSION_MAX_AGE ?? 604800); // 7 days

/** Write session token to the response cookie */
export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });
}

/** Read session token from the request cookie; null if absent */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/** Clear the session cookie (logout) */
export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// ─── API Access Token ──────────────────────────────────────────────────────────
export const API_TOKEN_COOKIE = "lotto_api_token";

export async function setApiTokenCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(API_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });
}

export async function getApiToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(API_TOKEN_COOKIE)?.value ?? null;
}

export async function clearApiTokenCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(API_TOKEN_COOKIE);
}

// ─── Member Code Cookie ────────────────────────────────────────────────────────
export const MEMBER_CODE_COOKIE = "lotto_member_code";

export async function setMemberCodeCookie(code: number): Promise<void> {
  const jar = await cookies();
  jar.set(MEMBER_CODE_COOKIE, String(code), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });
}

export async function getMemberCodeCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(MEMBER_CODE_COOKIE)?.value ?? null;
}

export async function clearMemberCodeCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(MEMBER_CODE_COOKIE);
}

// ─── Language Cookie ───────────────────────────────────────────────────────────
export const LANG_COOKIE = "lotto_lang";

export async function getLangCookie(): Promise<string> {
  const jar = await cookies();
  return jar.get(LANG_COOKIE)?.value ?? "th";
}

export async function setLangCookie(lang: string): Promise<void> {
  const jar = await cookies();
  jar.set(LANG_COOKIE, lang, {
    httpOnly: false,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });
}
