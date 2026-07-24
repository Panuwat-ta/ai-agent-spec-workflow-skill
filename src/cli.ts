#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Spec-Driven Development Skill CLI

Usage:
  agent <feature-name>           Initialize a new spec structure (implicit --init)
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

  // Ignore common directories and hidden files/folders (except specific ones if needed)
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

  const configPath = path.join(specsDir, '.config.agent');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '', 'utf8');
  }

  console.log(`\nInitializing spec workflow for: ${featureName}`);
  console.log(`Project context saved to .specs/${featureName}/project-context.md\n`);

  // Write files with AI prompt templates sequentially
  const reqPath = path.join(specsDir, 'requirements.md');
  const designPath = path.join(specsDir, 'design.md');
  const tasksPath = path.join(specsDir, 'tasks.md');

  if (!fs.existsSync(reqPath)) {
    const reqContent = `# Requirements: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Please read \`.specs/${featureName}/project-context.md\` to understand the project structure.\n> Then, write the User Stories and GIVEN/WHEN/THEN acceptance criteria for this feature here.\n>\n> [Please replace this block with your generated requirements]\n`;
    fs.writeFileSync(reqPath, reqContent, 'utf8');
    console.log(`[Step 1] Created requirements.md`);
    await askQuestion(`👉 Please open .specs/${featureName}/requirements.md, let AI generate it, and save.\n   Press ENTER to continue to Design...`);
  } else {
    console.log(`[Step 1] requirements.md already exists. Skipping.`);
  }

  if (!fs.existsSync(designPath)) {
    const designContent = `# Design: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Based on the approved \`requirements.md\` and project context, please generate the technical design.\n> Include Architecture, Components, and API Contracts.\n>\n> [Please replace this block with your generated design]\n`;
    fs.writeFileSync(designPath, designContent, 'utf8');
    console.log(`\n[Step 2] Created design.md`);
    await askQuestion(`👉 Please open .specs/${featureName}/design.md, let AI generate it, and save.\n   Press ENTER to continue to Tasks...`);
  } else {
    console.log(`[Step 2] design.md already exists. Skipping.`);
  }

  if (!fs.existsSync(tasksPath)) {
    const tasksContent = `# Tasks: ${featureName}\n\n> **@AI INSTRUCTION:**\n> Based on the approved \`design.md\`, please generate a checklist of actionable tasks.\n> Use \`[ ]\` for pending, \`[/]\` for in-progress, and \`[x]\` for completed.\n>\n> [Please replace this block with your generated task list]\n`;
    fs.writeFileSync(tasksPath, tasksContent, 'utf8');
    console.log(`\n[Step 3] Created tasks.md`);
  } else {
    console.log(`[Step 3] tasks.md already exists. Skipping.`);
  }

  console.log(`\n✅ All spec files generated successfully! You can now start coding.`);
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
    // Implicitly treat the first argument as the feature name if it doesn't start with a flag
    await initFeature(command);
  } else {
    console.log('Unknown command or missing parameter.');
    showHelp();
    process.exit(1);
  }
}

run();
