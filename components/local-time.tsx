"use client";

import { useEffect, useState } from "react";

export function LocalTime({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(
      new Date(date).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }, [date]);

  return <>{formatted}</>;
}

export function LocalDateTime({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString());
  }, [date]);

  return <>{formatted}</>;
}
