import { EARSPattern, ValidationResult } from '../types';

export function identifyEARSPattern(description: string): EARSPattern {
  const normalized = description.toLowerCase().trim();

  // Ubiquitous: The <system name> shall <system response>
  const isUbiquitous = /^(.+\s+)?shall\s+/.test(normalized) && 
    !normalized.includes('when ') && 
    !normalized.includes('while ') &&
    !normalized.includes('if ') &&
    !normalized.includes('where ');

  // Event-driven: When <trigger>, the <system name> shall <system response>
  const isEventDriven = /^when\s+.+,\s+(.+\s+)?shall\s+/.test(normalized);

  // State-driven: While <system state>, the <system name> shall <system response>
  const isStateDriven = /^while\s+.+,\s+(.+\s+)?shall\s+/.test(normalized);

  // Unwanted-event: If <trigger>, then the <system name> shall <system response>
  const isUnwantedEvent = /^if\s+.+,\s+then\s+(.+\s+)?shall\s+/.test(normalized) || /^if\s+.+,\s+(.+\s+)?shall\s+/.test(normalized);

  // Optional: Where <feature is included>, the <system name> shall <system response>
  const isOptional = /^where\s+.+,\s+(.+\s+)?shall\s+/.test(normalized);

  // Complex: Combinations like "While <state>, when <trigger>, the <system name> shall <response>"
  const hasMultipleConditions = 
    (normalized.includes('while ') && normalized.includes('when ')) ||
    (normalized.includes('while ') && normalized.includes('if ')) ||
    (normalized.includes('when ') && normalized.includes('if '));

  if (hasMultipleConditions && normalized.includes('shall ')) {
    return 'complex';
  }

  if (isEventDriven) return 'event-driven';
  if (isStateDriven) return 'state-driven';
  if (isUnwantedEvent) return 'unwanted-event';
  if (isOptional) return 'optional';
  if (isUbiquitous) return 'ubiquitous';

  return 'unknown';
}

export function validateEARSPatterns(descriptions: string[]): ValidationResult {
  const errors: string[] = [];

  descriptions.forEach((desc, index) => {
    const pattern = identifyEARSPattern(desc);
    if (pattern === 'unknown') {
      errors.push(`Requirement ${index + 1} does not match any EARS pattern: "${desc}"`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}
