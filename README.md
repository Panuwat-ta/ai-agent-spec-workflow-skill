# ai-agent-spec-workflow-skill

> **Plan first, then build.** Stop vibe coding. Start spec coding.

A CLI tool that enforces a structured **Spec-Driven Development** process for AI Agents. It ensures that requirements and designs are fully elaborated and validated before any implementation code is written.

## Features

- **Structured Planning**: 3 distinct phases (Requirements → Design → Tasks)
- **Step-by-Step Interactive Flow**: The CLI guides you through each phase one at a time
- **Smart Validation**: Checks that each document has real AI-generated content before moving on
- **Auto Tech-Stack Detection**: Automatically detects your project's language, framework, and dependencies
- **Cross-Referencing**: Each phase receives the content from the previous phase as context for the AI
- **Smart Resume**: Checkpoint system remembers your progress — pick up exactly where you left off
- **Graceful Ctrl+C**: Pause anytime and resume later with a friendly message
- **Beautiful Terminal UI**: Color-coded output with progress bars

## Installation

Install globally:

```bash
npm install -g ai-agent-spec-workflow-skill
```

Or use directly with `npx`:

```bash
npx agent user-authentication
```

## Usage

```bash
agent <feature-name>            # Start or resume a spec workflow
agent --list                    # List all features and their status
agent --reset <feature-name>    # Reset a feature workflow
agent --version                 # Show version
agent --help                    # Show help
```

### Example Workflow

```bash
$ agent user-authentication
```

```
--- Spec-Driven Development Workflow ---
   Feature: user-authentication

  [Step 1/3] - Requirements

  [CREATED] requirements.md

  -> Open .specs/user-authentication/requirements.md, let AI generate it, and save.
     Press ENTER to validate and continue...
```

## How It Works

### Phase 1: Requirements (`requirements.md`)
- The CLI creates the file with a detailed prompt template and your project context.
- Open the file in your AI-powered IDE and let the AI generate User Stories and Acceptance Criteria.
- Press ENTER — the CLI validates the content has real requirements, then moves on.

### Phase 2: Design (`design.md`)
- The CLI creates the design file with **your approved requirements embedded** as context.
- Let the AI define the architecture, data models, and API contracts.
- Press ENTER — the CLI validates and moves on.

### Phase 3: Tasks (`tasks.md`)
- The CLI creates the task file with **your approved design embedded** as context.
- Let the AI break the design down into an actionable step-by-step checklist.
- Press ENTER — done!

> **💡 Smart Resume**: Exit anytime with Ctrl+C. Run `agent <feature-name>` again to pick up exactly where you left off.

> **🔍 Auto-Detection**: The CLI automatically detects your tech stack (Node.js, Python, Go, Rust, Java, etc.) and includes it in the project context for better AI results.

## Generated File Structure

```
.specs/user-authentication/
├── project-context.md    ← Auto-generated (tech stack + directory tree)
├── requirements.md       ← User Stories & Acceptance Criteria
├── design.md             ← Architecture & API Contracts (with requirements context)
├── tasks.md              ← Actionable checklist (with design context)
└── .config.agent         ← Checkpoint state (auto-managed)
```

## License

MIT
