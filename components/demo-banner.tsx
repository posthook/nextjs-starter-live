import Link from "next/link";
import { GithubIcon } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="w-full pastel-lavender border-b-2 border-foreground text-xs py-2 px-3 sm:px-4 text-center font-medium flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1">
      <span className="text-muted-foreground">Live demo</span>
      <span className="hidden sm:inline text-foreground/20">|</span>
      <span className="hidden sm:inline">Sessions expire after 30 minutes</span>
      <span className="hidden sm:inline text-foreground/20">|</span>
      <Link
        href="https://posthook.io/app/signup?utm_source=nextjs-starter-live&utm_medium=demo&utm_campaign=starter"
        className="font-bold underline underline-offset-2 hover:text-foreground/70"
      >
        Sign up for Posthook
      </Link>
      <span className="hidden sm:inline text-foreground/20">|</span>
      <Link
        href="https://github.com/posthook/nextjs-starter"
        className="font-bold underline underline-offset-2 hover:text-foreground/70 inline-flex items-center gap-1"
      >
        <GithubIcon className="size-3" />
        Get the starter
      </Link>
    </div>
  );
}
