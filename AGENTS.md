## Working conventions

- Write code and comments in English; respond to the user in Brazilian Portuguese (pt-BR).
- Create commits only when the user requests them or a manually invoked skill explicitly requires them. Use Conventional Commits with descriptions in pt-BR.
- Match noun inflection to quantity: `1 classe`, `2 classes`, rather than `classe(s)`.
- Preserve validation quality while minimizing user disruption. Prefer checks without desktop control; use the UI when needed to prove behavior.
- For desktop interaction, prefer background input, group predictable actions into short sessions, and release control immediately after verification. Take focus, mouse, or keyboard only for the indispensable duration.
- In omp sessions, interact with the desktop only through omp's own computer-use tools. If disabled or unavailable, notify the user once, continue with available non-desktop checks, and report any pending UI validation.
- Outside omp, use the environment's available tools with the same minimal-disruption policy; do not require or warn about missing omp computer use.
- In omp sessions, necessary computer use is already authorized by the user; proceed without asking again, subject to tool-enforced approvals and required confirmations for consequential actions.

## Agent skills

### Issue tracker

Issues and specs live in local Markdown files under `.scratch/<feature>/`. Before creating, fetching, or updating tickets, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. Before triaging issues or changing their triage status, read `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `GLOSSARY.md` and `docs/adr/`. Before exploring the codebase, read `docs/agents/domain.md`.
