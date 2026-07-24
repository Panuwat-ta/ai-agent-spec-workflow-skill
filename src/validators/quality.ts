import { ValidationResult } from '../types';

export function detectVagueTerms(description: string, lineIndex: number = 0): string[] {
  const vagueTerms = [
    'tbd', 'appropriate', 'as needed', 'flexible', 'user-friendly', 
    'robust', 'fast', 'seamless', 'easy to use', 'state of the art'
  ];
  
  const warnings: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  vagueTerms.forEach(term => {
    if (lowerDesc.includes(term)) {
      warnings.push(`Line ${lineIndex + 1}: Vague term "${term}" found. Consider replacing with specific criteria.`);
    }
  });
  
  return warnings;
}

export function detectPronouns(description: string, lineIndex: number = 0): string[] {
  // Using word boundaries to avoid matching parts of words
  const pronouns = ['it', 'they', 'this', 'that', 'these', 'those'];
  const warnings: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  pronouns.forEach(pronoun => {
    const regex = new RegExp(`\\b${pronoun}\\b`, 'i');
    if (regex.test(lowerDesc)) {
      warnings.push(`Line ${lineIndex + 1}: Ambiguous pronoun "${pronoun}" found. Use specific noun instead.`);
    }
  });
  
  return warnings;
}

export function detectEscapeClauses(description: string, lineIndex: number = 0): string[] {
  const escapeClauses = [
    'if possible', 'as appropriate', 'to the extent possible', 
    'where applicable', 'as a minimum', 'but not limited to'
  ];
  
  const warnings: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  escapeClauses.forEach(clause => {
    if (lowerDesc.includes(clause)) {
      warnings.push(`Line ${lineIndex + 1}: Escape clause "${clause}" found. This makes the requirement untestable.`);
    }
  });
  
  return warnings;
}

export function validateQuality(descriptions: string[]): ValidationResult {
  const warnings: string[] = [];
  
  descriptions.forEach((desc, index) => {
    warnings.push(...detectVagueTerms(desc, index));
    warnings.push(...detectPronouns(desc, index));
    warnings.push(...detectEscapeClauses(desc, index));
  });
  
  return {
    isValid: true, // Quality checks only produce warnings, not errors
    errors: [],
    warnings
  };
}
