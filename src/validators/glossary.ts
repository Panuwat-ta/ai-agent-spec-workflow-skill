import { ValidationResult } from '../types';

export function extractTechnicalTerms(description: string): string[] {
  // Simple extraction: Words that start with a capital letter in the middle of a sentence
  // Or abbreviations (all caps)
  const terms: string[] = [];
  
  // Exclude the first word of the sentence
  const words = description.split(/\s+/).slice(1);
  
  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[.,;:()]/g, '');
    
    // Check if it's capitalized (e.g. Server, API, DataBase)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(cleanWord) && cleanWord.length > 1) {
      if (!terms.includes(cleanWord)) {
        terms.push(cleanWord);
      }
    }
  });
  
  return terms;
}

export function validateGlossaryCompleteness(
  descriptions: string[], 
  definedTerms: string[]
): ValidationResult {
  const warnings: string[] = [];
  const lowerDefinedTerms = definedTerms.map(t => t.toLowerCase());

  descriptions.forEach((desc, index) => {
    const extracted = extractTechnicalTerms(desc);
    
    extracted.forEach(term => {
      if (!lowerDefinedTerms.includes(term.toLowerCase())) {
        warnings.push(`Line ${index + 1}: Term "${term}" appears to be a technical term but is not defined in the glossary.`);
      }
    });
  });

  return {
    isValid: true, // Only warnings
    errors: [],
    warnings
  };
}
