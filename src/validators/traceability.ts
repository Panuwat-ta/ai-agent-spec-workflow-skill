import { ValidationResult } from '../types';

export function extractRequirementIds(requirementsContent: string): string[] {
  const ids: string[] = [];
  
  // Match lines like: "### REQ-1: Title" or "### 1.1: Title" or "### 1.1 Title"
  const reqHeaderRegex = /^###\s+([A-Za-z0-9.-]+)[:\s]/gm;
  let match;
  
  while ((match = reqHeaderRegex.exec(requirementsContent)) !== null) {
    if (match[1] && !ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  
  return ids;
}

export function validateDesignTraceability(
  designContent: string,
  requirementIds: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Extract all referenced requirement IDs from the design document
  // Format: "Validates: Requirements 1.1, 1.2"
  const validatesRegex = /\*\*Validates\*\*: Requirements\s+([A-Za-z0-9.,\s-]+)/g;
  let match;
  const referencedReqs = new Set<string>();
  
  while ((match = validatesRegex.exec(designContent)) !== null) {
    if (match[1]) {
      const refs = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
      refs.forEach(ref => {
        referencedReqs.add(ref);
        if (!requirementIds.includes(ref)) {
          errors.push(`Design references unknown requirement ID: "${ref}"`);
        }
      });
    }
  }
  
  // Check if all requirements are covered
  requirementIds.forEach(reqId => {
    if (!referencedReqs.has(reqId)) {
      warnings.push(`Requirement "${reqId}" is not validated by any design property.`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateTasksTraceability(
  tasksContent: string,
  designContent: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Extract components from design
  // Format: "### ComponentName"
  const componentRegex = /^###\s+(?!Property)([A-Za-z0-9_-]+)/gm;
  const designComponents = new Set<string>();
  let match;
  
  while ((match = componentRegex.exec(designContent)) !== null) {
    // Avoid matching properties
    if (match[1] && !match[1].startsWith('Property')) {
      designComponents.add(match[1]);
    }
  }
  
  // Extract design references from tasks
  // Format: "_Design: ComponentName_"
  const taskDesignRegex = /_Design:\s+([A-Za-z0-9_.,\s-]+)_/g;
  const referencedComponents = new Set<string>();
  
  while ((match = taskDesignRegex.exec(tasksContent)) !== null) {
    if (match[1]) {
      const refs = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
      refs.forEach(ref => {
        referencedComponents.add(ref);
        if (!designComponents.has(ref)) {
          errors.push(`Task references unknown design component: "${ref}"`);
        }
      });
    }
  }
  
  // Check if all components are covered by at least one task
  designComponents.forEach(comp => {
    if (!referencedComponents.has(comp)) {
      warnings.push(`Design component "${comp}" has no corresponding tasks.`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
