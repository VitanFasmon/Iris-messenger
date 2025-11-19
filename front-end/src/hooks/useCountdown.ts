import { useEffect, useState } from "react";

export function useCountdown(
  seconds: number | null,
  intervalMs: number = 1000
) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (seconds === null || seconds <= 0) {
      setRemaining(seconds);
      return;
    }
    setRemaining(seconds);
    const id = setInterval(() => {
      setRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, intervalMs);
    return () => clearInterval(id);
  }, [seconds, intervalMs]);

  return remaining;
}
