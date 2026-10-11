"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

export function OrderSuccessConfetti() {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  return null;
}
