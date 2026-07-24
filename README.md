# ai-agent-spec-workflow-skill

> **Plan first, then build.** Stop vibe coding. Start spec coding.

A CLI tool that enforces a structured **Spec-Driven Development** process for AI Agents. It ensures that requirements and designs are fully elaborated and validated before any implementation code is written.

## Features

- **Structured Planning**: 3 distinct phases (Requirements → Design → Tasks).
- **Step-by-Step Interactive Flow**: The CLI guides you through each phase one at a time.
- **Smart Validation**: Automatically checks that each document has real content before moving on.
- **Agent-Compatible**: Designed specifically to be used by AI Coding Agents (Cursor, Windsurf, Copilot, etc.).
- **Progress Tracking**: Clear status tracking using `[ ]`, `[/]`, `[x]`.
- **Smart Resume**: Checkpoint system remembers your progress — pick up exactly where you left off.

## Installation & Setup

Install the package globally to access the `agent` command from anywhere:

```bash
npm install -g ai-agent-spec-workflow-skill
```

Or use it directly with `npx`:

```bash
npx agent user-authentication
```

## Usage

Simply type `agent` followed by the name of the feature you want to build:

```bash
agent user-authentication
```

The CLI will automatically scan your project structure and guide you **step-by-step**:

```
Initializing spec workflow for: user-authentication
Project context saved to .specs/user-authentication/project-context.md

[Step 1] Created requirements.md
👉 Please open .specs/user-authentication/requirements.md, let AI generate it, and save.
   Press ENTER to continue to Design...
```

## How It Works

### Phase 1: Requirements (`requirements.md`)
- The CLI creates the file and pauses.
- Open the file in your AI-powered IDE and let the AI generate User Stories and Acceptance Criteria.
- The CLI validates that the file has real content (not just the template).
- **Action**: Review, save, and press **ENTER** in your terminal.

### Phase 2: Design (`design.md`)
- The CLI creates the design file.
- Let the AI define the architecture, data models, and API contracts.
- The CLI validates that design content was actually generated.
- **Action**: Review, save, and press **ENTER** in your terminal.

### Phase 3: Tasks (`tasks.md`)
- The CLI creates the final checklist file.
- Let the AI break the design down into an actionable step-by-step checklist.
- The CLI validates that tasks were generated with proper checklist format.
- **Action**: You approve the checklist, and the AI begins coding!

> **💡 Smart Resume**: If you exit the CLI midway through, simply run `agent <feature-name>` again. It will automatically detect your progress and resume exactly where you left off!

## Generated File Structure

```
.specs/user-authentication/
├── project-context.md    ← Auto-generated project structure for AI context
├── requirements.md       ← User Stories & Acceptance Criteria
├── design.md             ← Architecture & API Contracts
├── tasks.md              ← Actionable checklist
└── .config.agent         ← Checkpoint state (auto-managed)
```

## License

MIT
