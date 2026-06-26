"use client";

import { useState } from "react";

export function ShareRow({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Ayúdanos a encontrar a ${name}. #SOSVEN`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "SOSVEN", text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
        </svg>
        {copied ? "¡Enlace copiado!" : "Compartir"}
      </button>
    </div>
  );
}
