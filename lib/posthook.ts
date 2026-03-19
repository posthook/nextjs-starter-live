import Posthook from "@posthook/node";

// Lazy singleton — avoids throwing during Next.js build when env vars aren't set.
// The client is stateless (just stores config), so cold starts are <1ms.
let _client: Posthook | null = null;

export function posthook(): Posthook {
  if (!_client) {
    _client = new Posthook(process.env.POSTHOOK_API_KEY!, {
      signingKey: process.env.POSTHOOK_SIGNING_KEY!,
    });
  }
  return _client;
}
