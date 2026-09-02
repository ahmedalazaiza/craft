---
trigger: always_on
---

# Production Ready — Always On

This project is connected to a real backend and database. Treat every change as production.

## Non-negotiable
- Do not invent user-facing numbers, names, or stats.
- Views, likes, comments, prices, dates, and counts must come from the database or API already used in this repo.
- A project published a minute ago has 0 views and 0 likes until real events exist. Dummy values like 140 views are bugs.
- If the UI needs a value that the API does not return, add the field to the backend and wire it. Do not hardcode it in the component.
- 0, empty state, and "no activity yet" are correct production UI. Fake popularity is not.
- Mocks, faker, and static showcase JSON belong in tests, Storybook, or a flagged demo route only.
- Before editing a card, page, or dashboard, search the codebase for the real query/hook/payload and reuse it.
- After the edit, state which file and which field now feed the UI.

## Before you write code
1. Find the source of truth for the entity (schema + endpoint + client hook).
2. List the fields already available.
3. Use those fields. Add missing ones end-to-end (db → api → ui).
4. Preserve empty/zero states.

## Forbidden in production UI
- Hardcoded metrics (views: 140, likes: 23, followers: 1.2k)
- Fake authors that are not the signed-in or stored owner
- Lorem, John Doe, placeholder emails shown as live data
- Random stock content presented as the user's project stats
- Client-side fake increment of views