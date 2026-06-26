export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-flag-red text-white shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21Z" />
        </svg>
      </span>
      <span className="text-lg">SOSVEN</span>
    </span>
  );
}
