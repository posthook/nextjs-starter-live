import Link from "next/link";
import { GithubIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <main className="max-w-2xl w-full">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block pastel-lavender border-2 border-foreground rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            Posthook + Next.js Starter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">
            Schedule Delayed Tasks in Next.js Without Cron, Queues, or Workflow Engines
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto text-balance">
            <Link
              href="https://posthook.io?utm_source=nextjs-starter-live&utm_medium=demo&utm_campaign=starter"
              className="font-bold text-foreground underline underline-offset-4 decoration-2"
            >
              Posthook
            </Link>{" "}
            gives your Next.js app durable per-event timers. Schedule a
            reminder, expiration, or follow-up with one API call — your
            route handler runs when the time comes.
          </p>
        </div>

        {/* What's in the starter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            {
              color: "pastel-mint",
              title: "Webhook handlers",
              file: "app/api/webhooks/remind/route.ts",
              description:
                "One route per hook type. Each handler verifies the HMAC signature, checks task state, and acts or no-ops.",
              href: "https://github.com/posthook/nextjs-starter/blob/main/app/api/webhooks/remind/route.ts",
            },
            {
              color: "pastel-peach",
              title: "Task state machine",
              file: "lib/tasks.ts",
              description:
                "Schedule-first ordering, conditional updates, and epoch-based snooze.",
              href: "https://github.com/posthook/nextjs-starter/blob/main/lib/tasks.ts",
            },
            {
              color: "pastel-sky",
              title: "Scheduling patterns",
              file: "PATTERNS.md",
              description:
                "Seven copy-pasteable patterns including per-event timers, state verification, epoch snooze, conditional updates, and idempotency keys.",
              href: "https://github.com/posthook/nextjs-starter/blob/main/PATTERNS.md",
            },
            {
              color: "pastel-lavender",
              title: "Posthook SDK setup",
              file: "lib/posthook.ts",
              description:
                "Lazy singleton for Next.js build safety. Works with any Postgres instance and any deployment platform.",
              href: "https://github.com/posthook/nextjs-starter/blob/main/lib/posthook.ts",
            },
          ].map(({ color, title, file, description, href }) => (
            <Link
              key={title}
              href={href}
              className={`comic-card p-4 ${color} block`}
            >
              <div className="text-base font-bold mb-0.5">{title}</div>
              <div className="text-xs font-mono text-muted-foreground mb-2">
                {file}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </div>
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <form action="/api/sessions" method="POST">
            <button
              type="submit"
              className="comic-btn jiggle bg-foreground text-background px-8 py-2.5 text-sm"
            >
              Try it live with a human-in-the-loop AI review
            </button>
          </form>
        </div>

        {/* Repo cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8">
          <Link
            href="https://github.com/posthook/nextjs-starter"
            className="comic-card-static p-4 pastel-yellow text-sm hover:opacity-80 transition-opacity"
          >
            <div className="font-bold mb-0.5 flex items-center gap-1.5"><GithubIcon className="size-3.5" /> Starter repo</div>
            <div className="text-muted-foreground text-xs">
              API routes, webhook handlers, and scheduling patterns.
              Clone this to get started.
            </div>
          </Link>
          <Link
            href="https://github.com/posthook/nextjs-starter-live"
            className="comic-card-static p-4 pastel-rose text-sm hover:opacity-80 transition-opacity"
          >
            <div className="font-bold mb-0.5 flex items-center gap-1.5"><GithubIcon className="size-3.5" /> Live demo repo</div>
            <div className="text-muted-foreground text-xs">
              Source for this app. Adds UI, session isolation, and
              seeded data on top of the starter.
            </div>
          </Link>
        </div>

        {/* Context */}
        <div className="text-center text-sm text-muted-foreground max-w-lg mx-auto">
          <p>
            Built with Next.js, Postgres, Drizzle ORM, OpenAI, and{" "}
            <Link
              href="https://posthook.io?utm_source=nextjs-starter-live&utm_medium=demo&utm_campaign=starter"
              className="font-bold text-foreground hover:underline"
            >
              Posthook
            </Link>
            . No cron to maintain. No workflow engine to learn.
          </p>
        </div>
      </main>
    </div>
  );
}
