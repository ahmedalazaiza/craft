# GEMINI.md — Project Law

You are working on a production application with a live backend and database.

Load and obey `.agents/rules/production-ready.md` on every turn.

Default stance for this entire repo, A to Z:

- Real data only. Never invent views, likes, counts, names, or dates.
- A newly published project shows 0 views and 0 likes until real events exist.
- Find the existing schema → API → hook → component path before editing UI.
- If a field is missing, add it end-to-end. Do not hardcode the UI.
- Empty, zero, loading, error, and forbidden are required production states.
- Mocks belong in tests or an explicit DEMO flag only.
- Do not mark work done without naming the source field for every visible number.

When the user asks for any UI, card, page, dashboard, or copy change, inspect data bindings first, then design.

Also use the matching skill when relevant:
- `.agents/skills/production-ready/SKILL.md`