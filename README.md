# ai-agent-spec-workflow-skill

> **Plan first, then build.** Stop vibe coding. Start spec coding.

A workflow engine and CLI tool that enforces a structured **Spec-Driven Development** process for AI Agents. It ensures that requirements and designs are fully elaborated and validated before any implementation code is written.

## Features

- **Structured Planning**: 3 distinct phases (Requirements → Design → Tasks).
- **Behavior-Driven**: Write GIVEN/WHEN/THEN acceptance criteria.
- **Traceability**: Every task traces back to a design component, and every component traces back to a requirement.
- **Agent-Compatible**: Designed specifically to be used by AI Coding Agents (Antigravity, Cursor, Windsurf, Copilot).
- **Progress Tracking**: Clear status tracking using `[ ]`, `[/]`, `[x]`.
- **Human-in-the-Loop**: Requires user approval before moving to the next phase.

## Installation & Setup

Install the package globally to access the `agent` command from anywhere:

```bash
npm install -g ai-agent-spec-workflow-skill
```

### 1. Initialize a New Feature Spec

Simply type `agent` followed by the name of the feature you want to build:

```bash
agent user-authentication
```

The CLI will automatically scan your project structure to provide context for the AI, and then guide you **step-by-step** through the specification process:

```
Initializing spec workflow for: user-authentication
Project context saved to .specs/user-authentication/project-context.md

[Step 1] Created requirements.md
👉 Please open .specs/user-authentication/requirements.md, let AI generate it, and save.
   Press ENTER to continue to Design...
```

## How to Use with AI Agents

The workflow is now fully interactive and sequential. When the CLI pauses at each step, switch to your AI-powered IDE (like Cursor or Windsurf) and trigger the AI to write the content for you. 

### Phase 1: Requirements (`requirements.md`)
- The CLI creates the file and pauses.
- Open the file and let the AI generate the User Stories and Acceptance Criteria.
- **Action**: Review the generated content, save the file, and press **ENTER** in your terminal.

### Phase 2: Design (`design.md`)
- The CLI creates the design file based on your requirements.
- Open the file and let the AI define the architecture, data models, and API contracts.
- **Action**: Review the generated content, save the file, and press **ENTER** in your terminal.

### Phase 3: Tasks (`tasks.md`)
- The CLI creates the final checklist file.
- Open the file and let the AI break the design down into an actionable step-by-step checklist.
- **Action**: You approve the checklist, and the AI begins coding!

> **💡 Smart Resume**: If you exit the CLI midway through, simply run `agent <feature-name>` again. It will automatically detect your progress and resume exactly where you left off!

## Programmatic API

You can also use the core validation engine programmatically in Node.js:

```typescript
import { 
  initializeWorkflow, 
  generateRequirements, 
  generateDesign, 
  generateTasks 
} from 'ai-agent-spec-workflow-skill';

// Initialize a new feature specification
initializeWorkflow('auth-system');
```

## License

MIT
