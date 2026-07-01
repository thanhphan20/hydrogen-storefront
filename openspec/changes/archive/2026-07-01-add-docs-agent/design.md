## Context

Docs previously drifted silently: `CHANGELOG.md` carried ~2800 lines inherited from the upstream Hydrogen skeleton and was never updated for this project's actual history; `RELEASE.md` was a one-line stub; `README.md` was missing several `.env.example` variables and referenced an outdated Hydrogen version. This repo is used from multiple AI coding tools (Claude Code, Codex, OpenCode, Cursor), so the fix needs to live somewhere all of them can act on, not just Claude-specific config.

## Goals / Non-Goals

**Goals:**
- Make documentation requirements explicit and tool-agnostic (`openspec/specs/docs-maintenance/spec.md`), so any AI tool operating on this repo can check compliance.
- Give Claude Code specifically an actionable subagent (`.claude/agents/docs.md`) that implements those requirements.
- Remove the two doc files that had no maintenance process behind them.

**Non-Goals:**
- Building agent-specific doc-maintenance automation for Codex/OpenCode/Cursor in this change — only Claude Code gets a dedicated subagent for now. The other three tools get OpenSpec's standard `/opsx:*` propose/apply/archive workflow, which is sufficient for them to read and act on `openspec/specs/docs-maintenance/spec.md` directly.
- Automating spec compliance checks in CI — out of scope for this change.

## Decisions

- **Spec lives in `openspec/specs/`, not `.claude/`**: requirements about what docs must cover are tool-agnostic facts about the project, so they belong in OpenSpec's shared spec store rather than a Claude-only file. Any tool (or human) can read `openspec/specs/docs-maintenance/spec.md`.
- **Only Claude gets a `docs` subagent**: of the four configured tools (claude, codex, opencode, cursor), only Claude Code's agent format was available and requested for a proactive subagent in this change. Codex/OpenCode/Cursor rely on the OpenSpec skills/commands already wired up by `openspec init` to read specs and drive changes.
- **Delete rather than backfill `CHANGELOG.md`/`RELEASE.md`**: neither had an owner or process; backfilling them would just recreate the original problem. The `docs-maintenance` spec explicitly forbids reintroducing them without a process.

## Risks / Trade-offs

- [Docs still drift if no one invokes the `docs` agent or checks the spec] → Mitigation: the subagent description states it should be used proactively after route/env/dependency changes; the spec's scenarios give a checkable definition of "done" for manual review.
- [Codex/OpenCode/Cursor users have no automatic trigger, only the spec text] → Mitigation: acceptable for this change since those tools weren't asked to get dedicated automation; can be added later as a follow-up change if needed.
