---
version: 1
slug: "worklog-src-app-styles-css"
primary_target: "worklog/src/app/styles.css"
related_targets: ["worklog/src/features/worklog","worklog/src/app/layout"]
---

Scope: the worklog app shell and both task surfaces (entry, summary). Visitor mode: Operate.

Audience: an employee logging several rows a day; a reviewer reading rollups. Task: capture unit + project + hours fast, then read totals by day/week/month. Constraint: three languages incl. Bengali; no image assets exist.

## Direction contract

THESIS: A timesheet staged on GSAP's dark chalkboard — cream type on near-black, outlined-only controls, colour used strictly as taxonomy. It refuses the filled-CTA admin panel, and refuses GSAP's own 224px hero and 3D blobs, which have no job on a screen opened six times a day.

OWN-WORLD: Canvas #0e100f, cream #fffce1 ink, muted #7c7c6f, hairlines #42433d, nested panel #191919. Every control is a ghost pill at 100px radius with a 1px cream border; the sole chromatic escalation is the green gradient-stroked primary. Cards 8px. Inter Tight for Mori. Five discipline hues become a business-unit taxonomy, assigned deterministically per unit name.

STORY: The logger files an entry against a dark stage and sees today's total in cream; the reviewer reads which unit owns the week by its colour, not by reading labels.

FIRST VIEWPORT: Near-black rail left carrying cream nav; canvas right. Page title 44px cream, today's total top-right. Entry card #191919 at 8px, fields dark with cream hairlines, green gradient-stroked "Add entry" pill bottom-left.

FORM: Brief-pinned world (user supplied GSAP DESIGN.md); no concept roll and no seed key — a pinned direction beats the roll. Light theme is a user-required extension the source does not define; dark is canonical.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
