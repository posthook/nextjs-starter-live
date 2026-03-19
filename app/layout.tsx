import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedule Delayed Tasks in Next.js Without Cron — Posthook Starter",
  description:
    "Open-source Next.js starter for scheduling delayed tasks with Posthook. " +
    "Reminders, expirations, and snooze with durable per-event timers. No cron, no queues. Try the live demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto py-4 text-center text-xs text-muted-foreground">
          <a
            href="https://posthook.io?utm_source=nextjs-starter-live&utm_medium=demo&utm_campaign=starter"
            className="hover:text-foreground"
          >
            © 2026 Posthook, Inc.
          </a>
        </footer>
      </body>
    </html>
  );
}
