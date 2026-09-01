<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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

# Mandatory Supabase SQL Provisioning Rule

Whenever any feature, bug fix, policy, schema alteration, storage change, or database logic requires running SQL commands in Supabase, you MUST provide the exact, copy-pasteable, idempotent SQL query directly in the response with clear instructions on how to execute it in the Supabase SQL Editor.

