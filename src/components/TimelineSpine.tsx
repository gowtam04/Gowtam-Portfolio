"use client";

import { useEffect, useRef } from "react";

/**
 * The vertical rule down the Process section that fills with the accent
 * color as the reader scrolls: the pipeline's forward flow, made literal.
 */
export function TimelineSpine() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      return;
    }

    let raf = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const anchor = window.innerHeight * 0.6;
      const progress = Math.min(Math.max((anchor - rect.top) / rect.height, 0), 1);
      fill.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="absolute bottom-6 left-[7px] top-1 w-px"
    >
      <div className="absolute inset-0 bg-[var(--border)]" />
      <div
        ref={fillRef}
        className="absolute inset-0 origin-top bg-[var(--accent)]"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
