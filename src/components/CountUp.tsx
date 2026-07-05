"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string;
  className?: string;
}

const NUMERIC = /^([^\d]*)([\d,]+)(.*)$/;

/**
 * Renders a stat value, animating its numeric part from 0 on first view.
 * Non-numeric values (e.g. "24/7", "Live") render statically. Tabular
 * figures in .mono-stat keep the layout stable while counting.
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(NUMERIC);
    if (!match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [, prefix, numeric, suffix] = match;
    const target = parseInt(numeric.replace(/,/g, ""), 10);
    if (!Number.isFinite(target) || target === 0) return;
    const useGrouping = numeric.includes(",");

    let frame: number;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 700;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.round(target * eased);
          const rendered = useGrouping
            ? current.toLocaleString("en-US")
            : String(current);
          setDisplay(`${prefix}${rendered}${suffix}`);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
