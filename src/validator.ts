/**
 * Lightweight validator for spec files.
 * Checks that AI has actually written content (not just the template placeholder).
 */
import * as fs from 'fs';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

export interface TaskStatus {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  percent: number;
}

/**
 * Check if a file still contains only the original AI instruction template.
 * Returns true if the file has been filled with real content.
 */
function hasRealContent(content: string): boolean {
  // If the file still has the placeholder text, AI hasn't written anything yet
  if (content.includes('[Please replace this')) {
    return false;
  }

  // Strip markdown headers, blockquotes, and <details> sections
  const stripped = content
    .replace(/^#.*$/gm, '')       // remove headers
    .replace(/^>.*$/gm, '')       // remove blockquotes (AI instructions)
    .replace(/<details>[\s\S]*?<\/details>/g, '') // remove details context
    .replace(/\s+/g, ' ')         // normalize whitespace
    .trim();

  // Must have at least some meaningful text (more than 50 chars beyond boilerplate)
  return stripped.length > 50;
}

/**
 * Validate requirements.md has user stories or acceptance criteria
 */
export function validateRequirements(filePath: string): ValidationResult {
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    return { isValid: false, warnings: ['File does not exist.'] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (!hasRealContent(content)) {
    warnings.push('⚠️  requirements.md still contains the template placeholder. AI has not generated content yet.');
    return { isValid: false, warnings };
  }

  // Check for GIVEN/WHEN/THEN or user story patterns
  const hasGWT = /given|when|then/i.test(content);
  const hasUserStory = /as a|i want|so that/i.test(content);

  if (!hasGWT && !hasUserStory) {
    warnings.push('💡 Tip: Consider adding GIVEN/WHEN/THEN acceptance criteria or User Stories for better clarity.');
  }

  return { isValid: true, warnings };
}

/**
 * Validate design.md has architecture or component definitions
 */
export function validateDesign(filePath: string): ValidationResult {
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    return { isValid: false, warnings: ['File does not exist.'] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (!hasRealContent(content)) {
    warnings.push('⚠️  design.md still contains the template placeholder. AI has not generated content yet.');
    return { isValid: false, warnings };
  }

  // Check for typical design markers
  const hasArchitecture = /architect|component|module|service|api|endpoint|schema|model|database|interface/i.test(content);

  if (!hasArchitecture) {
    warnings.push('💡 Tip: Consider including architecture details, components, or API contracts in your design.');
  }

  return { isValid: true, warnings };
}

/**
 * Validate tasks.md has a checklist
 */
export function validateTasks(filePath: string): ValidationResult {
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    return { isValid: false, warnings: ['File does not exist.'] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (!hasRealContent(content)) {
    warnings.push('⚠️  tasks.md still contains the template placeholder. AI has not generated content yet.');
    return { isValid: false, warnings };
  }

  // Check for strict markdown checklist format
  const checklistRegex = /^[ \t]*[-*][ \t]+\[([ x/])\]/gim;
  const matches = [...content.matchAll(checklistRegex)];
  const taskCount = matches.length;

  if (taskCount === 0) {
    warnings.push('[TIP] Consider using markdown checklist format (- [ ]) for tracking task progress.');
  } else if (taskCount < 3) {
    warnings.push(`[TIP] Only ${taskCount} task(s) found. Consider breaking down into more granular tasks.`);
  }

  return { isValid: true, warnings };
}

/**
 * Parse tasks.md and return current status
 */
export function getTaskStatus(filePath: string): TaskStatus | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const checklistRegex = /^[ \t]*[-*][ \t]+\[([ x/])\]/gim;
  
  let total = 0;
  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  let match;
  while ((match = checklistRegex.exec(content)) !== null) {
    if (match[1]) {
      total++;
      const state = match[1].toLowerCase();
      if (state === 'x') completed++;
      else if (state === '/') inProgress++;
      else pending++;
    }
  }

  if (total === 0) return null;

  return {
    total,
    completed,
    inProgress,
    pending,
    percent: Math.round((completed / total) * 100)
  };
}
