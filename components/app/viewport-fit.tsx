"use client";

/**
 * Keeps the layout inside the *visible* viewport.
 *
 * iOS lays the keyboard over the web view without shrinking `100dvh`, so an
 * action pinned to the bottom of the layout ends up underneath it. The visual
 * viewport API is the only thing that reports the space actually left over,
 * and it behaves the same in a browser and in the Capacitor shell.
 *
 * Publishes `--app-vh` on <html>; the CSS falls back to 100dvh anywhere the
 * API is missing.
 */

import { useEffect } from "react";

export function ViewportFit() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    // Written straight through rather than deferred: a frame callback never
    // runs while the app is backgrounded, and coming back to a stale height
    // is worse than the one style write this costs.
    const sync = () => {
      root.style.setProperty("--app-vh", `${Math.round(vv.height)}px`);
    };

    // WebKit scrolls the document to lift a focused field clear of the
    // keyboard. The shell already fits the space the keyboard leaves, so that
    // scroll only drags the header out of sight — put it back.
    const pin = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const onViewportChange = () => {
      sync();
      pin();
    };

    sync();
    pin();
    vv.addEventListener("resize", onViewportChange);
    vv.addEventListener("scroll", onViewportChange);
    window.addEventListener("scroll", pin, { passive: true });
    window.addEventListener("orientationchange", sync);
    return () => {
      vv.removeEventListener("resize", onViewportChange);
      vv.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("scroll", pin);
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty("--app-vh");
    };
  }, []);

  return null;
}
