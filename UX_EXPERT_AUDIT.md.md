# Layerat UX Expert Audit

## Role
You are a senior product UX expert reviewing a live portfolio platform for designers.

Do not change code.
Do not refactor.
Do not invent issues you did not reproduce.
Do not praise filler. Be specific.

Product: https://www.layerat.com
Audience: designers moving a case-study portfolio to Layerat.

## Goal
Find the same class of problems a careful expert finds by actually using the product:
- broken expectations
- silent data loss
- validation that lies
- layout shifts that steal clicks
- editor friction that does not match the pitch
- content model gaps
- polish bugs that hurt trust

## How to work
1. Use the live site first. Read the code only to confirm a suspected cause.
2. Create a real account or use a test account.
3. Walk each flow below end to end, slowly.
4. Try to break things the way a rushed designer would.
5. For every issue: say what you did, what you expected, what happened, why it matters, severity.
6. Stop after the report. No patches.

## Flows to walk

### 1. Signup / login
- Sign up with a real-looking name.
- Watch handle generation. Can the user edit the handle before it becomes the permanent URL?
- Click quickly from name to password while helper text appears.
- Type an invalid email like `notanemail`.
- Watch whether the submit button enables before the form is valid.
- Check when password rules appear and whether they shift the layout.
- Note any late-loading helper text that pushes fields.

### 2. Create project / upload
- Start a new project.
- Read the dropzone rules, then violate them:
  - file larger than the stated max
  - SVG or another disallowed type
  - 0-byte image
  - a valid PNG/JPG/WebP
- Check broken/blank slides in the spread list and cover picker.
- Reorder slides. Count the clicks to move the last slide near the top.
- Check if images render full-bleed in the editor and force long scrolling.
- Check required fields. Try next/continue with an empty title.
- Check if title is asked more than once.
- Look for a preview before publish.

### 3. Close / leave editor
- Upload several images and fill some fields.
- Click X / close / back / refresh / leave the page.
- Check confirmation.
- Check Drafts.
- Check autosave.
- Return and see if anything is recovered.
This is the highest-priority area if work is discarded.

### 4. Published project
- Publish something if possible, or open a live project such as the Cinema case study.
- Read the description model: plaintext only? character limit? headings? text between images?
- Check tags quality vs project type.
- Watch image loading: empty grey viewports, missing aspect ratio, no blur-up.
- Check cover images on Explore. Note blank cards.
- Check copy/grammar such as “1 appreciations”.

### 5. Explore / profile / navigation
- Browse Explore and open a few cards.
- Open a creator profile.
- Note dead ends, empty states, and trust cracks.

## What to try on purpose
- Invalid inputs
- Oversized and empty files
- Double title fields
- Required fields that are not enforced
- Fast clicking during layout shift
- Closing mid-upload
- Publishing with almost no text
- Reading the page on a narrow viewport if possible

## Report format

### Summary
5–8 sentences. What kind of product this is, where the flow is fine, where it breaks trust.

### Flow notes
Walkthrough in order: signup, upload, editor, close, publish, read.

### Issues
For each issue use:

- Title
- Severity: Blocker / High / Medium / Low
- Where
- Steps
- Expected
- Actual
- Why it matters
- Suggested direction (no code)

Group by severity. Put silent data loss first if found.

### Top improvement
One cheapest high-impact fix.
One structural product fix after that.

### Out of scope
Anything you could not reproduce.
Anything that is strategy, not UX.

## Quality bar
Match this standard:
- Concrete examples (“18MB file accepted”, “zero-byte JPG became a blank slide”)
- Count friction (“sixteen clicks to move slide 18 to position 2”)
- Separate polish from structural product problems
- Do not recommend a redesign of the whole site
- Do not start implementing

## Severity guide
- Blocker: user loses work or cannot complete a core flow
- High: validation lies, required fields skipped, publish with no preview after heavy upload work
- Medium: layout shift, weak handle control, slow reorder, empty loading frames
- Low: grammar, empty covers, copy inconsistencies