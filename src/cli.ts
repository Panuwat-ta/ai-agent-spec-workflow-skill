#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { validateRequirements, validateDesign, validateTasks } from './validator';

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Spec-Driven Development CLI

Usage:
  agent <feature-name>           Initialize a new spec structure
  agent --init <feature-name>    Initialize a new spec structure

Examples:
  agent user-authentication
  `);
}

function scanDirectory(dir: string, prefix: string = '', depth: number = 0, maxDepth: number = 5): string {
  if (depth > maxDepth) return '';
  let output = '';
  
  let items: string[] = [];
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return '';
  }

  const ignores = ['.git', 'node_modules', 'dist', 'build', 'coverage', '.specs', '.idea', '.vscode'];
  items = items.filter(item => !ignores.includes(item) && !item.startsWith('.'));

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isLast = index === items.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    
    let isDir = false;
    try {
      isDir = fs.statSync(fullPath).isDirectory();
    } catch (e) {
      return;
    }

    output += `${prefix}${marker}${item}\n`;

    if (isDir) {
      output += scanDirectory(fullPath, prefix + (isLast ? '    ' : '│   '), depth + 1, maxDepth);
    }
  });

  return output;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Run validation on a spec file, print warnings, and ask user to retry if invalid.
 * Returns true if validation passes (or user chooses to skip).
 */
async function validateAndConfirm(
  filePath: string,
  validateFn: (path: string) => { isValid: boolean; warnings: string[] },
  stepName: string
): Promise<void> {
  while (true) {
    const result = validateFn(filePath);

    // Print warnings
    if (result.warnings.length > 0) {
      console.log('');
      result.warnings.forEach(w => console.log(`   ${w}`));
    }

    if (result.isValid) {
      // Valid — show tips if any, then proceed
      if (result.warnings.length > 0) {
        console.log('');
      }
      return;
    }

    // Invalid — ask user to retry or skip
    console.log('');
    const answer = await askQuestion(`   The ${stepName} appears incomplete. Press ENTER to re-check, or type "skip" to proceed anyway: `);
    
    if (answer.trim().toLowerCase() === 'skip') {
      console.log(`   ⏩ Skipping validation for ${stepName}.`);
      return;
    }
    // Otherwise loop and re-validate
  }
}

async function initFeature(featureName: string) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, '.specs', featureName);
  
  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true });
  }

  // Generate project-context.md by scanning the directory
  const contextPath = path.join(specsDir, 'project-context.md');
  if (!fs.existsSync(contextPath)) {
    const tree = scanDirectory(cwd);
    const contextContent = `# Project Context\n\nThis file contains the directory structure of the current project to help the AI understand the context.\n\n\`\`\`\n${path.basename(cwd)}/\n${tree}\`\`\`\n`;
    fs.writeFileSync(contextPath, contextContent, 'utf8');
  }

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
      console.log(`⚠️  Warning: Could not read .config.agent — starting from the beginning.`);
      config = { phase: 'requirements' };
    }
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  console.log(`\n🚀 Initializing spec workflow for: ${featureName}`);
  console.log(`📁 Project context saved to .specs/${featureName}/project-context.md\n`);

  const reqPath = path.join(specsDir, 'requirements.md');
  const designPath = path.join(specsDir, 'design.md');
  const tasksPath = path.join(specsDir, 'tasks.md');

  // Step 1: Requirements
  if (config.phase === 'requirements') {
    if (!fs.existsSync(reqPath)) {
      const reqContent = `# Requirements: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Please read \`.specs/${featureName}/project-context.md\` to understand the project structure.\n> Then, write the User Stories and GIVEN/WHEN/THEN acceptance criteria for this feature here.\n>\n> [Please replace this block with your generated requirements]\n`;
      fs.writeFileSync(reqPath, reqContent, 'utf8');
      console.log(`[Step 1/3] 📝 Created requirements.md`);
    } else {
      console.log(`[Step 1/3] 🔄 Resuming at requirements.md`);
    }
    await askQuestion(`👉 Please open .specs/${featureName}/requirements.md, let AI generate it, and save.\n   Press ENTER to validate and continue...`);
    
    // Validate before proceeding
    await validateAndConfirm(reqPath, validateRequirements, 'requirements');
    console.log(`   ✅ Requirements validated!`);
    
    config.phase = 'design';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // Step 2: Design
  if (config.phase === 'design') {
    if (!fs.existsSync(designPath)) {
      const designContent = `# Design: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Based on the approved \`requirements.md\` and project context, please generate the technical design.\n> Include Architecture, Components, and API Contracts.\n>\n> [Please replace this block with your generated design]\n`;
      fs.writeFileSync(designPath, designContent, 'utf8');
      console.log(`\n[Step 2/3] 📝 Created design.md`);
    } else {
      console.log(`\n[Step 2/3] 🔄 Resuming at design.md`);
    }
    await askQuestion(`👉 Please open .specs/${featureName}/design.md, let AI generate it, and save.\n   Press ENTER to validate and continue...`);
    
    // Validate before proceeding
    await validateAndConfirm(designPath, validateDesign, 'design');
    console.log(`   ✅ Design validated!`);
    
    config.phase = 'tasks';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // Step 3: Tasks
  if (config.phase === 'tasks') {
    if (!fs.existsSync(tasksPath)) {
      const tasksContent = `# Tasks: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Based on the approved \`design.md\`, please generate a checklist of actionable tasks.\n> Use \`[ ]\` for pending, \`[/]\` for in-progress, and \`[x]\` for completed.\n>\n> [Please replace this block with your generated task list]\n`;
      fs.writeFileSync(tasksPath, tasksContent, 'utf8');
      console.log(`\n[Step 3/3] 📝 Created tasks.md`);
    } else {
      console.log(`\n[Step 3/3] 🔄 Resuming at tasks.md`);
    }
    await askQuestion(`👉 Please open .specs/${featureName}/tasks.md, let AI generate it, and save.\n   Press ENTER to validate and complete...`);
    
    // Validate before completing
    await validateAndConfirm(tasksPath, validateTasks, 'tasks');
    console.log(`   ✅ Tasks validated!`);
    
    config.phase = 'completed';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  if (config.phase === 'completed') {
    console.log(`\n🎉 All spec files generated and validated successfully!`);
    console.log(`📂 Your specs are ready at: .specs/${featureName}/`);
    console.log(`🚀 You can now start coding!\n`);
  }

  rl.close();
}

async function run() {
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const param = args[1];

  if (command === '--init' && param) {
    await initFeature(param);
  } else if (command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  } else if (command && !command.startsWith('-')) {
    await initFeature(command);
  } else {
    console.log('Unknown command or missing parameter.');
    showHelp();
    process.exit(1);
  }
}

run();
