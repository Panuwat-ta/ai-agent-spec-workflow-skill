import { ValidationResult } from '../types';

export function validateFeatureName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim() === '') {
    errors.push('Feature name cannot be empty.');
    return { isValid: false, errors, warnings: [] };
  }

  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  if (!kebabCaseRegex.test(name)) {
    if (/[A-Z]/.test(name)) {
      errors.push('Feature name must be lowercase.');
    }
    if (/\s/.test(name)) {
      errors.push('Feature name cannot contain spaces.');
    }
    if (/[^a-zA-Z0-9-\s]/.test(name)) {
      errors.push('Feature name can only contain lowercase letters, numbers, and hyphens.');
    }
    if (name.startsWith('-') || name.endsWith('-')) {
      errors.push('Feature name cannot start or end with a hyphen.');
    }
    if (name.includes('--')) {
      errors.push('Feature name cannot contain consecutive hyphens.');
    }
    
    // Fallback if none of the specific conditions matched (should be rare)
    if (errors.length === 0) {
       errors.push('Feature name must be in kebab-case (e.g., feature-name).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}
