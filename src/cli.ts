#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { c } from './colors';
import { generateProjectContext } from './context';
import { validateRequirements, validateDesign, validateTasks } from './validator';

const VERSION = '1.2.0';
const args = process.argv.slice(2);

// ─── Graceful Ctrl+C ──────────────────────────────────
let currentPhase = '';
let currentFeature = '';

process.on('SIGINT', () => {
  console.log('');
  if (currentPhase && currentFeature) {
    console.log(c.yellow(`\n[PAUSED]  Workflow paused at ${c.bold(currentPhase)}.`));
    console.log(c.dim(`   Run "${c.cyan(`agent ${currentFeature}`)}" again to resume.\n`));
  }
  process.exit(0);
});

// ─── Readline ──────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

// ─── Help ──────────────────────────────────────────────
function showHelp() {
  console.log(`
${c.bold('Spec-Driven Development CLI')}  ${c.dim(`v${VERSION}`)}

${c.yellow('Usage:')}
  ${c.cyan('agent <feature-name>')}           Start or resume a spec workflow
  ${c.cyan('agent --list')}                   List all features and their status
  ${c.cyan('agent --reset <feature-name>')}   Reset a feature workflow
  ${c.cyan('agent --version')}                Show version
  ${c.cyan('agent --help')}                   Show this help

${c.yellow('Examples:')}
  ${c.dim('$')} agent user-authentication
  ${c.dim('$')} agent --list
  ${c.dim('$')} agent --reset user-authentication
  `);
}

// ─── Prompt Templates ──────────────────────────────────
function getRequirementsPrompt(featureName: string, contextContent: string): string {
  return `# Requirements: ${featureName}

> **@AI INSTRUCTION:**
> You are a senior product manager. Based on the project context below, write complete requirements for the "${featureName}" feature.
>
> **Output format:**
> 1. A brief description of the feature
> 2. User Stories in the format: "As a [role], I want [action], so that [benefit]"
> 3. Acceptance Criteria for each story in GIVEN/WHEN/THEN format
> 4. Non-functional requirements (performance, security, etc.) if applicable
>
> **Example:**
> ## User Story 1: User Login
> As a registered user, I want to log in with my email and password, so that I can access my account.
>
> ### Acceptance Criteria
> - GIVEN a registered user on the login page
>   WHEN they enter a valid email and password and click "Login"
>   THEN they should be redirected to the dashboard
>
> [Please replace this entire block with your generated requirements]

---

<details>
<summary>📁 Project Context (click to expand)</summary>

${contextContent}

</details>
`;
}

function getDesignPrompt(featureName: string, requirementsContent: string): string {
  return `# Design: ${featureName}

> **@AI INSTRUCTION:**
> You are a senior software architect. Based on the approved requirements below, write the technical design for the "${featureName}" feature.
>
> **Output format:**
> 1. Architecture overview (how this feature fits into the existing system)
> 2. Component breakdown (list each module/service/class needed)
> 3. Data model / schema changes
> 4. API contracts (endpoints, request/response format)
> 5. Key technical decisions and trade-offs
>
> [Please replace this entire block with your generated design]

---

<details>
<summary>📋 Approved Requirements (click to expand)</summary>

${requirementsContent}

</details>
`;
}

function getTasksPrompt(featureName: string, designContent: string): string {
  return `# Tasks: ${featureName}

> **@AI INSTRUCTION:**
> You are a senior developer. Based on the approved design below, break it down into an actionable implementation checklist.
>
> **Output format:**
> - Use \`[ ]\` for pending tasks, \`[/]\` for in-progress, \`[x]\` for completed
> - Group tasks by component or layer
> - Order tasks by dependency (what needs to be built first)
> - Each task should be small enough to complete in 1-2 hours
>
> **Example:**
> ## Database Layer
> - [ ] Create migration for users table
> - [ ] Add User model with validations
>
> ## API Layer
> - [ ] Implement POST /api/auth/login endpoint
> - [ ] Add JWT token generation
>
> [Please replace this entire block with your generated task list]

> **🚨 @AI INSTRUCTION FOR IMPLEMENTATION PHASE:**
> When the user asks you to start coding, you MUST strictly keep this file updated.
> Change \`[ ]\` to \`[x]\` as soon as you finish each task. Do not wait until the end.

---

<details>
<summary>📐 Approved Design (click to expand)</summary>

${designContent}

</details>
`;
}

// ─── Validation Loop ───────────────────────────────────
async function validateAndConfirm(
  filePath: string,
  validateFn: (path: string) => { isValid: boolean; warnings: string[] },
  stepName: string
): Promise<void> {
  while (true) {
    const result = validateFn(filePath);

    if (result.warnings.length > 0) {
      console.log('');
      result.warnings.forEach(w => console.log(`   ${w}`));
    }

    if (result.isValid) {
      if (result.warnings.length > 0) console.log('');
      return;
    }

    console.log('');
    const answer = await askQuestion(c.dim(`   File appears incomplete. Press ENTER to re-check, or type "skip" to proceed anyway: `));

    if (answer.trim().toLowerCase() === 'skip') {
      console.log(c.yellow(`   [SKIP] Skipping validation for ${stepName}.`));
      return;
    }
  }
}

// ─── List Features ─────────────────────────────────────
function listFeatures() {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, '.specs');

  if (!fs.existsSync(specsDir)) {
    console.log(c.dim('\n  No features found. Run "agent <feature-name>" to create one.\n'));
    return;
  }

  const features = fs.readdirSync(specsDir).filter(item => {
    return fs.statSync(path.join(specsDir, item)).isDirectory();
  });

  if (features.length === 0) {
    console.log(c.dim('\n  No features found. Run "agent <feature-name>" to create one.\n'));
    return;
  }

  console.log(`\n${c.bold('--- Feature Status ---')}\n`);

  const phaseIcons: Record<string, string> = {
    'requirements': '[Requirements]',
    'design':       '[Design]',
    'tasks':        '[Tasks]',
    'completed':    '[Completed]',
  };

  features.forEach(feature => {
    const configPath = path.join(specsDir, feature, '.config.agent');
    let phase = 'requirements';

    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf8');
        if (raw.trim()) {
          phase = JSON.parse(raw).phase || 'requirements';
        }
      } catch (e) { /* ignore */ }
    }

    const icon = phaseIcons[phase] || `[${phase}]`;
    console.log(`  ${c.bold(feature)}  ->  ${icon}`);
  });

  console.log('');
}

// ─── Reset Feature ─────────────────────────────────────
async function resetFeature(featureName: string) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, '.specs', featureName);

  if (!fs.existsSync(specsDir)) {
    console.log(c.red(`\n  Feature "${featureName}" not found.\n`));
    return;
  }

  const answer = await askQuestion(c.yellow(`\n[WARNING] This will delete all spec files for "${featureName}". Are you sure? (y/N): `));

  if (answer.trim().toLowerCase() === 'y') {
    fs.rmSync(specsDir, { recursive: true, force: true });
    console.log(c.green(`\n[SUCCESS] Feature "${featureName}" has been reset. Run "agent ${featureName}" to start over.\n`));
  } else {
    console.log(c.dim('\n  Reset cancelled.\n'));
  }

  rl.close();
}

// ─── Main Init Feature ────────────────────────────────
async function initFeature(featureName: string) {
  currentFeature = featureName;
  const cwd = process.cwd();
  const specsDir = path.join(cwd, '.specs', featureName);

  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true });
  }

  // Generate project-context.md
  const contextPath = path.join(specsDir, 'project-context.md');
  const contextContent = generateProjectContext(cwd);
  fs.writeFileSync(contextPath, contextContent, 'utf8');

  // Checkpoint config
  const configPath = path.join(specsDir, '.config.agent');
  let config = { phase: 'requirements' };

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      if (raw.trim()) {
        config = JSON.parse(raw);
      }
    } catch (e) {
      console.log(c.yellow(`[WARNING] Could not read .config.agent - starting from the beginning.`));
      config = { phase: 'requirements' };
    }
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // Already completed
  if (config.phase === 'completed') {
    console.log(`\n${c.green('[SUCCESS]')} Feature ${c.bold(featureName)} is already completed!`);
    console.log(c.dim(`   Run "${c.cyan(`agent --reset ${featureName}`)}" to start over.\n`));
    rl.close();
    return;
  }

  console.log(`\n${c.bold(c.cyan('--- Spec-Driven Development Workflow ---'))}`);
  console.log(c.dim(`   Feature: ${featureName}\n`));

  const reqPath = path.join(specsDir, 'requirements.md');
  const designPath = path.join(specsDir, 'design.md');
  const tasksPath = path.join(specsDir, 'tasks.md');

  // ── Step 1: Requirements ──
  if (config.phase === 'requirements') {
    currentPhase = 'Step 1 (Requirements)';
    console.log(c.cyan(`  [Step 1/3]`) + c.dim(' - Requirements\n'));

    if (!fs.existsSync(reqPath)) {
      fs.writeFileSync(reqPath, getRequirementsPrompt(featureName, contextContent), 'utf8');
      console.log(`  ${c.green('[CREATED]')} ${c.bold('requirements.md')}`);
    } else {
      console.log(`  ${c.blue('[RESUMING]')} ${c.bold('requirements.md')}`);
    }
    await askQuestion(c.dim(`\n  -> Open .specs/${featureName}/requirements.md, let AI generate it, and save.\n     Press ENTER to validate and continue...`));

    await validateAndConfirm(reqPath, validateRequirements, 'requirements');
    console.log(`  ${c.green('[OK] Requirements validated!')}`);

    config.phase = 'design';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // ── Step 2: Design (with cross-reference) ──
  if (config.phase === 'design') {
    currentPhase = 'Step 2 (Design)';
    console.log('');
    console.log(c.cyan(`  [Step 2/3]`) + c.dim(' - Design\n'));

    // Cross-reference: inject requirements content into design prompt
    const reqContent = fs.existsSync(reqPath)
      ? fs.readFileSync(reqPath, 'utf8')
      : '(requirements.md not found)';

    if (!fs.existsSync(designPath)) {
      fs.writeFileSync(designPath, getDesignPrompt(featureName, reqContent), 'utf8');
      console.log(`  ${c.green('[CREATED]')} ${c.bold('design.md')} ${c.dim('(with requirements context)')}`);
    } else {
      console.log(`  ${c.blue('[RESUMING]')} ${c.bold('design.md')}`);
    }
    await askQuestion(c.dim(`\n  -> Open .specs/${featureName}/design.md, let AI generate it, and save.\n     Press ENTER to validate and continue...`));

    await validateAndConfirm(designPath, validateDesign, 'design');
    console.log(`  ${c.green('[OK] Design validated!')}`);

    config.phase = 'tasks';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // ── Step 3: Tasks (with cross-reference) ──
  if (config.phase === 'tasks') {
    currentPhase = 'Step 3 (Tasks)';
    console.log('');
    console.log(c.cyan(`  [Step 3/3]`) + c.dim(' - Tasks\n'));

    // Cross-reference: inject design content into tasks prompt
    const designContent = fs.existsSync(designPath)
      ? fs.readFileSync(designPath, 'utf8')
      : '(design.md not found)';

    if (!fs.existsSync(tasksPath)) {
      fs.writeFileSync(tasksPath, getTasksPrompt(featureName, designContent), 'utf8');
      console.log(`  ${c.green('[CREATED]')} ${c.bold('tasks.md')} ${c.dim('(with design context)')}`);
    } else {
      console.log(`  ${c.blue('[RESUMING]')} ${c.bold('tasks.md')}`);
    }
    await askQuestion(c.dim(`\n  -> Open .specs/${featureName}/tasks.md, let AI generate it, and save.\n     Press ENTER to validate and complete...`));

    await validateAndConfirm(tasksPath, validateTasks, 'tasks');
    console.log(`  ${c.green('[OK] Tasks validated!')}`);

    config.phase = 'completed';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // ── Done! ──
  console.log('');
  console.log(c.bold(c.green('  [SUCCESS] All spec files generated and validated successfully!')));
  console.log(`  ${c.dim('-')} Your specs are ready at: ${c.cyan(`.specs/${featureName}/`)}`);
  console.log(`  ${c.dim('-')} You can now start coding!\n`);

  rl.close();
}

// ─── CLI Entry Point ───────────────────────────────────
async function run() {
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const param = args[1];

  if (command === '--version' || command === '-v') {
    console.log(`v${VERSION}`);
    process.exit(0);
  } else if (command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  } else if (command === '--list' || command === '-l') {
    listFeatures();
    process.exit(0);
  } else if (command === '--reset' && param) {
    await resetFeature(param);
  } else if (command === '--init' && param) {
    await initFeature(param);
  } else if (command && !command.startsWith('-')) {
    await initFeature(command);
  } else {
    console.log(c.red('Unknown command or missing parameter.'));
    showHelp();
    process.exit(1);
  }
}

run();
