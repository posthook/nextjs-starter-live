import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { seedSession } from "@/lib/demo/seed";
import { COOKIE_NAME, SESSION_TTL } from "@/lib/demo/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(COOKIE_NAME)?.value;
  let needsSeed = false;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_TTL,
    });
    needsSeed = true;
  }

  if (needsSeed) {
    try {
      await seedSession(sessionId);
    } catch (err) {
      console.error("[sessions] Seed failed:", err);
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
