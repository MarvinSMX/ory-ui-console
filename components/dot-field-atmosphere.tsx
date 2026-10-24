"use client";

import { useEffect } from "react";

/**
 * Exact DotFieldShell markup from auth/web / kratos-selfservice-ui-node.
 * WebGL lives in /auth-web/dot-field.js (copied from selfservice fork).
 */
export function DotFieldAtmosphere() {
  useEffect(() => {
    const existing = document.querySelector(
      'script[data-mrvn-dot-field="1"]',
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "/auth-web/dot-field.js";
    script.defer = true;
    script.dataset.mrvnDotField = "1";
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 mrvn-dot-field-layer"
      aria-hidden
      data-mrvn-dot-field-layer
    >
      <div
        aria-hidden
        data-mrvn-dot-field-root
        data-mrvn-dot-field-preset="vignette"
        data-mrvn-dot-field-active
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden dot-field-vignette"
      >
        <canvas
          className="dot-field-canvas absolute inset-0 h-full w-full"
          data-mrvn-dot-field-preset="vignette"
        />
      </div>
    </div>
  );
}
