"use client";

import { useState, useEffect } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "any moment";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export function Countdown({
  target,
  label,
  className = "",
}: {
  target: string;
  label: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    setRemaining(new Date(target).getTime() - Date.now());
    const id = setInterval(() => {
      setRemaining(new Date(target).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!mounted) {
    return <span className={`font-mono text-[11px] font-bold ${className}`}>{label} ...</span>;
  }

  if (remaining < -30000) return null;

  return (
    <span className={`font-mono text-[11px] font-bold ${className}`}>
      {label} {formatRemaining(remaining)}
    </span>
  );
}
