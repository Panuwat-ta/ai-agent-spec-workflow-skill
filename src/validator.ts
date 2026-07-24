/**
 * Lightweight validator for spec files.
 * Checks that AI has actually written content (not just the template placeholder).
 */
import * as fs from 'fs';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Check if a file still contains only the original AI instruction template.
 * Returns true if the file has been filled with real content.
 */
function hasRealContent(content: string): boolean {
  // If the file still has the placeholder text, AI hasn't written anything yet
  if (content.includes('[Please replace this block with your generated')) {
    return false;
  }

  // Strip markdown headers and whitespace, check if there's meaningful content
  const stripped = content
    .replace(/^#.*$/gm, '')       // remove headers
    .replace(/^>.*$/gm, '')       // remove blockquotes (AI instructions)
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

  // Check for checklist format
  const hasChecklist = /\[[ x/]\]/i.test(content);
  const taskCount = (content.match(/\[[ x/]\]/g) || []).length;

  if (!hasChecklist) {
    warnings.push('💡 Tip: Consider using checklist format ([ ], [x]) for tracking task progress.');
  } else if (taskCount < 3) {
    warnings.push(`💡 Tip: Only ${taskCount} task(s) found. Consider breaking down into more granular tasks.`);
  }

  return { isValid: true, warnings };
}
