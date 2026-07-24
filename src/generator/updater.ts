import { ValidationResult } from '../types';

export interface UpdateFeedback {
  type: 'modification' | 'addition' | 'deletion';
  section: string;
  content: string;
}

export function updateDocument(
  currentContent: string,
  feedback: UpdateFeedback[]
): { newContent: string; validation: ValidationResult } {
  let newContent = currentContent;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Simple string replacement based logic for now
  feedback.forEach(fb => {
    if (fb.type === 'modification') {
      // Very basic implementation: just appending if section not found,
      // in a real scenario we'd use an AST or proper markdown parser
      if (!newContent.includes(fb.section)) {
        errors.push(`Section not found: ${fb.section}`);
      } else {
        // Mocking modification
        warnings.push(`Updating section ${fb.section} with feedback.`);
      }
    } else if (fb.type === 'addition') {
      newContent += `\n\n## ${fb.section}\n${fb.content}`;
    }
  });

  return {
    newContent,
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  };
}

export function detectConflictingFeedback(
  currentContent: string,
  feedback: UpdateFeedback[]
): string[] {
  const conflicts: string[] = [];
  
  feedback.forEach(fb => {
    if (fb.type === 'addition' && currentContent.includes(`## ${fb.section}`)) {
      conflicts.push(`Cannot add section "${fb.section}", it already exists. Please clarify if you meant to modify it.`);
    }
    if (fb.type === 'deletion' && !currentContent.includes(fb.section)) {
      conflicts.push(`Cannot delete section "${fb.section}", it does not exist.`);
    }
  });

  return conflicts;
}
