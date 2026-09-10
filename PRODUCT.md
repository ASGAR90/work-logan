# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the person logging time.** An employee at a services organization recording their own daily work: which business unit it sat under, which project or client it was for, and how many hours it took. They log in short bursts, usually at the end of a day or between tasks, and frequently enter several rows for the same day.

**Secondary — the reviewer.** A manager or admin who needs to see across people: hours by business unit and by project or client, over a day, week, or month. Confirmed as a real audience; the surface serving them does not exist yet.

## Product Purpose

Record where working time actually goes — per person, per day — and make the aggregate legible without anyone assembling a spreadsheet. Success is that people log reliably enough that the weekly and monthly totals can be trusted for planning and client reporting.

## Positioning

Every entry is anchored to two dimensions at the moment of capture: business unit and project/client. Rollups by unit and by client are therefore a property of the data model, not a reconciliation someone performs afterwards. This is a deliberately narrow record — it is not a task timer, a project manager, or an invoicing tool.

## Operating Context

- Entries are made in short repeat bursts. Several rows for the same day, same unit, same project is the dominant path, not the exception.
- Reached in a browser at `https://dburqx-ekmse.slsblx.com`, behind SELISE Blocks hosted login (OIDC, email + password).
- Local development requires HTTPS served on the real project domain — a hosts-file entry plus a trusted certificate. Plain `localhost` never receives the Blocks session cookie, so it cannot be used to test a signed-in state.
- Built on SELISE Blocks: identity, the data gateway, and localization are platform services, not application code.

## Capabilities and Constraints

**Confirmed and built**

- Create, edit, and delete a work log entry: business unit, project or client, hours, date, and optional notes.
- Daily, weekly, and monthly summaries, each showing total hours plus a breakdown by business unit and by project/client.
- Hours accept quarter-hour increments, must be greater than 0 and at most 24 per entry; dates cannot be in the future.
- Weeks run Monday to Sunday.
- Dates are stored as plain `yyyy-MM-dd` strings and compared as such, so an entry always belongs to the day the person picked regardless of their timezone.

**Platform facts**

- Data lives in the Blocks Data Gateway `WorkLog` schema. `CreatedBy` stamps the author automatically, so authorship needs no application field.
- Auth is Blocks hosted OIDC (email + password). Password policy: minimum 8 characters with upper case, lower case, and a digit.
- Only the platform-seeded `clouduser` role exists on the project.

**Confirmed gaps — real needs with nothing built yet**

- The reviewer role is not modelled, and no cross-person reporting surface exists.
- ~~German and Bengali carry no translated content~~ — resolved. The `worklog` module (63 keys) is pushed and machine-translated into `de-DE` and `bn-BD` via the platform's own AI translation; the `common` module already carried 301 platform-seeded keys in all three languages. **The de/bn copy is machine-generated and has had no native review** — treat it as a first pass, not final.

**Explicitly undecided**

- Whether reviewers *approve* entries (a workflow with states, locking, and an audit trail) or only *view* them (reporting alone). This materially changes the data model and must be answered before that surface is designed. Do not assume either.

**Explicitly ruled out**

- Per-user privacy is **not** a requirement. Reviewers are intended to see across people; this is a shared record, not a private one. Do not add an ownership-based access policy on the assumption that it was an oversight.

## Brand Commitments

- The **GSAP design system is binding for the worklog app** (source: `DESIGN.md`). Near-black canvas `#0e100f`, warm cream ink `#fffce1`, muted `#7c7c6f`, hairlines `#42433d`, nested panel `#191919`. **Every control is an outlined ghost pill at 100px radius** — filled CTAs are a stated Don't. The single chromatic escalation permitted is the green gradient-stroked primary (`#0ae448` → `#abff84`). Cards 8px. Mori is licensed; **Inter Tight** is the named substitute (plain Inter is explicitly forbidden). Body type stays between 14px and 23px.
- **Colour is taxonomy, never decoration.** The five discipline hues are reassigned to business units — one stable hue per unit name, derived from the name so it never shifts — and appear on that unit's summary label and bar. The label is always present, so colour never carries meaning alone.
- **Light/dark switcher is a user requirement, and dark is canonical.** The source is `Theme: dark` and defines no light palette. Light is derived by inverting to the system's own Cream Surface with Just Black ink; every accent is darkened to hold 4.5:1 on cream, which forces pink to resolve magenta. A stored choice wins; with none stored the OS preference decides.
- GSAP's marketing devices are **declined for this Operate surface**: the 224px hero, edge-bleeding display type, and 3D organic illustrations. The type scale is used from subheading down. All four departures are documented in the header comment of `worklog/src/app/styles.css`.
- The **Awesomic and Ally systems are superseded** for this app. Neither governs any named surface; treat both as historical unless the user scopes one.
- No company name, logo, tone-of-voice guidance, or other identity constraint has been established.

## Evidence on Hand

- The application at `worklog/`, and a live `WorkLog` schema on the Blocks project `work-logan` (`D941c710e5c634ff6a326e5d279a32fd8`).
- **No real content exists.** Zero work log entries, zero end users, no customers, testimonials, benchmarks, pricing, or case studies. Future work must not fabricate any of these, including as placeholder or demo copy that could be mistaken for real.
- Languages configured on the project: `en-US` (default), `de-DE`, `bn-BD`.

## Product Principles

1. **Logging costs seconds, not minutes.** Repeat entry is the main path; anything that makes the second entry of a day as expensive as the first is a defect.
2. **Both dimensions, always.** An entry without a business unit and a project/client cannot roll up, so capture never treats either as optional detail.
3. **Totals must be trustworthy.** No silent rounding drift, no timezone shifting an entry into the wrong day. A number people cannot trust is worse than no number.
4. **This is a shared record.** Visibility across people is the design intent, not a compromise to be quietly walked back.
5. **Every user-visible string is translatable.** Three languages are a stated requirement, so hard-coded copy is a defect, not a shortcut.

## Accessibility & Inclusion

Three-language support including Bengali is a confirmed requirement, so layouts must tolerate substantially different string lengths and a non-Latin script without truncation. No product-specific accessibility standard was set beyond the design system's own bar: 4.5:1 text contrast, visible focus indicators, and respect for reduced-motion.
