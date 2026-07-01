## Why

`CHANGELOG.md` and `RELEASE.md` were unmaintained template artifacts that drifted from the real project (the changelog held ~2800 lines from the upstream Hydrogen skeleton; the release notes were a single stale stub). README.md itself had also drifted (missing env vars, an outdated Hydrogen version). Docs need an owner and a repeatable process so they stay accurate as routes, env vars, and dependencies change, instead of relying on someone remembering to update them by hand.

## What Changes

- Remove `CHANGELOG.md` and `RELEASE.md` (unmaintained, not reintroduced).
- Update `README.md` to match current code: Stripe Embedded Checkout feature, corrected Hydrogen version, full `.env.example` coverage in the configuration table, links to `guides/**`.
- Add a `docs` subagent (`.claude/agents/docs.md`) that other AI tools/agents can invoke to keep `README.md` and `guides/**` in sync with `package.json`, `.env.example`, and `app/routes/` after code changes.
- Introduce this OpenSpec-tracked `docs-maintenance` capability describing the docs agent's scope, triggers, and acceptance criteria, so the contract isn't tied to any single AI tool's config format.

## Capabilities

### New Capabilities
- `docs-maintenance`: Defines what project documentation must cover, what triggers an update, and the acceptance criteria a doc update must satisfy (env vars fully listed, script table matches `package.json`, no references to nonexistent routes/features, no reintroduction of unmaintained changelog/release files).

### Modified Capabilities
(none — no existing `openspec/specs/` capabilities predate this change)

## Impact

- Affected files: `README.md`, `CHANGELOG.md` (removed), `RELEASE.md` (removed), `.claude/agents/docs.md`.
- No runtime/code impact — documentation and process only.
- Establishes `openspec/specs/docs-maintenance/spec.md` as the durable source of truth for doc requirements, independent of any single AI tool (Claude, Cursor, etc. can all read/enforce it).
