## 1. Cleanup

- [x] 1.1 Remove `CHANGELOG.md` (unmaintained, inherited from upstream Hydrogen skeleton)
- [x] 1.2 Remove `RELEASE.md` (unmaintained stale stub)

## 2. README accuracy

- [x] 2.1 Add Stripe Embedded Checkout to the Features list
- [x] 2.2 Correct Hydrogen version callout to match `package.json`
- [x] 2.3 Expand the configuration table to cover every variable in `.env.example`
- [x] 2.4 Link `guides/predictiveSearch` and `guides/search` from the Documentation section

## 3. Docs agent

- [x] 3.1 Create `.claude/agents/docs.md` subagent scoped to README/guides maintenance
- [x] 3.2 Define trigger conditions, ground-truth sources, and acceptance criteria for doc updates

## 4. OpenSpec adoption

- [x] 4.1 Initialize OpenSpec (`openspec/`) scoped to claude, codex, opencode, cursor
- [x] 4.2 Write `docs-maintenance` capability spec covering env var, script, version, and dead-reference requirements
- [x] 4.3 Archive this change into `openspec/specs/docs-maintenance/spec.md` once reviewed
