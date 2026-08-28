# Mandatory Multi-Role Execution Pipeline (100% Perfection & Zero Complacency)

Every single user request MUST pass through the following strict multi-stage pipeline before being presented to the user:

1. **Request Intake & Deep Analysis**:
   - Thoroughly dissect the user request, identify root causes, edge cases, dependencies, and business logic.
   - Do NOT rush into partial patches.

2. **Implementation (Craft Core)**:
   - Build the requested feature or fix with state-of-the-art code quality, adhering to modern Next.js 16 / React 19 standards.
   - Zero placeholders, zero dummy workarounds, zero sloppy shortcuts.

3. **DevOps & Stability Gate**:
   - Verify build integrity with `npm run validate` (`tsc --noEmit && next build`).
   - Audit network latency, environment variables, database query safety, and bundle size.
   - Ensure 0 console errors, 0 runtime warnings, 0 type errors.

4. **UX & Design Gate**:
   - Audit responsiveness (mobile, tablet, desktop).
   - Ensure instantaneous interactions, 60/120fps animations, zero layout shift (CLS), WCAG AA color contrast, and seamless micro-interactions.
   - Zero flashes, zero flickering overlays, zero sluggish transitions.

5. **Code Reviewer & Quality Gate**:
   - Audit for dead code, unneeded dependencies, anti-patterns, typing issues, and messy naming.
   - Ensure DRY principles, clean architecture, and modularity.

**CRITICAL DIRECTIVE**: If ANY gate (DevOps, UX, Code Review) flags an issue, you MUST immediately rebuild and fix it internally before reporting back. Only deliver 100% perfected, fully verified work to the user.
