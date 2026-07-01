## ADDED Requirements

### Requirement: Environment variable documentation completeness
`README.md`'s configuration table SHALL list every variable present in `.env.example`, each with an accurate one-line description of its purpose.

#### Scenario: New env var added
- **WHEN** a variable is added to `.env.example`
- **THEN** `README.md`'s configuration table is updated to include that variable before the change is considered documented

#### Scenario: Env var removed
- **WHEN** a variable is removed from `.env.example`
- **THEN** the corresponding row is removed from `README.md`'s configuration table

### Requirement: Development command documentation completeness
`README.md`'s Development Commands table SHALL match the `scripts` entries in `package.json` that a developer would run manually (excluding internal/helper scripts not meant for direct invocation).

#### Scenario: Script added to package.json
- **WHEN** a new script is added to `package.json` for direct developer use
- **THEN** `README.md`'s Development Commands table includes that script and a one-line description

### Requirement: Version references stay current
Version numbers called out in `README.md` (Hydrogen, React Router, Tailwind CSS, or other headline dependencies) SHALL match the corresponding version in `package.json`.

#### Scenario: Dependency version bump
- **WHEN** a headline dependency's version changes in `package.json`
- **THEN** any README callout of that version is updated to match

### Requirement: No references to nonexistent features
Documentation SHALL NOT describe routes, components, or features that do not exist in `app/`.

#### Scenario: Feature removed from codebase
- **WHEN** a route or feature described in README or a guide is removed from `app/`
- **THEN** the corresponding documentation section is removed or updated, not left referencing dead code

### Requirement: No unmaintained changelog/release files
The project SHALL NOT maintain a `CHANGELOG.md` or `RELEASE.md` file, since these were unmaintained template artifacts that drifted from the actual project history.

#### Scenario: Changelog file reappears
- **WHEN** a `CHANGELOG.md` or `RELEASE.md` file is added back to the repository
- **THEN** it is flagged for removal rather than populated or maintained

### Requirement: Docs agent triggers on relevant changes
An AI coding agent (e.g. Claude Code's `docs` subagent) SHALL be invoked to review and update documentation after changes to `app/routes/`, `.env.example`, or `package.json` dependencies/scripts.

#### Scenario: Route added
- **WHEN** a new route file is added under `app/routes/`
- **THEN** the docs agent reviews whether README's feature list or folder structure needs updating

#### Scenario: Docs review requested directly
- **WHEN** a user asks for a documentation review or cleanup
- **THEN** the docs agent is invoked to check README and guides against current code and env/config files
