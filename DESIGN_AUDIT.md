# SOSVEN — Design Audit

Run with the `design-auditor` skill (12-category weighted scoring, WCAG contrast,
token compliance). Date: 2026-06-26.

## Grades

| Dimension      | Before | After fixes | Gate            |
| -------------- | ------ | ----------- | --------------- |
| Design         | B (80.3) | **B (83.0)** | min B ✅ |
| AI Slop        | B (8/10) | **B (8/10)** | — |
| Accessibility  | B (8/10) | **A (9/10)** | A required ✅ |

Release gate (≥ B Design, A Accessibility): **PASS**.

## Objective checks

- **WCAG AA contrast:** 14/14 sampled UI pairs pass (was 12/14). The two failures
  were both greens — fixed (see below).
- **Design-token compliance:** ~100% for color. Zero hardcoded hex, zero inline
  styles, zero arbitrary color utilities in components. Only intentional arbitrary
  values are `text-[11px]` micro-labels and aspect ratios.

## Fixes applied during the audit

1. **Green contrast (HIGH).** `--color-success-600` → `#0f7a38` and
   `--color-success` → `#0e7035`. White-on-green button went 3.3:1 → 5.4:1;
   success text on tint 4.41:1 → 5.8:1.
2. **Form errors announced (HIGH a11y).** `role="alert"` on validation messages
   in the report form and sighting/found panels.
3. **Skip-to-content link (a11y).** Added before the header, focuses `<main>`.
4. **Global focus-visible ring** for all interactive elements.
5. **prefers-reduced-motion** guard: disables transitions/animations and gates
   smooth scroll for users who request reduced motion.

## Remaining recommendations (not blocking)

- **HIGH (content):** Replace placeholder phone numbers (`0800-SOS-VEN`, `911`,
  `171`) with the official verified crisis lines before launch.
- **MEDIUM:** Verify the report form + profile sidebar on physical devices.
- **MEDIUM:** Consider ISR / short-TTL cache for the directory listing (currently
  `force-dynamic`) to cut TTFB while keeping reports fresh.
- **LOW:** Wrap success confirmations in `role="status"`; optional display face
  for the hero; nudge `--color-muted` darker if used for small text on surface.
