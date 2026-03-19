import { cookies } from "next/headers";

export const COOKIE_NAME = "demo_session";
export const SESSION_TTL = 30 * 60; // 30 minutes

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function requireSessionId(): Promise<string> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    throw new Error("No demo session — redirect to landing page");
  }
  return sessionId;
}
