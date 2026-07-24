import { extractTechnicalTerms, validateGlossaryCompleteness } from './glossary';

describe('Glossary Validator', () => {
  it('should extract capitalized terms from the middle of sentences', () => {
    const desc = 'The system shall connect to the Database using API keys.';
    const terms = extractTechnicalTerms(desc);
    expect(terms).toContain('Database');
    expect(terms).toContain('API');
    expect(terms).not.toContain('The'); // First word ignored
    expect(terms).not.toContain('system');
  });

  it('should remove punctuation from extracted terms', () => {
    const desc = 'When authorized, the Server (which is fast) shall respond.';
    const terms = extractTechnicalTerms(desc);
    expect(terms).toContain('Server');
    expect(terms).not.toContain('Server(');
  });

  it('should validate glossary completeness correctly', () => {
    const descriptions = [
      'The client shall send a Request to the Backend.',
      'If the Request fails, the system shall log an Error.'
    ];
    
    const definedTerms = ['Request', 'Backend'];
    
    const result = validateGlossaryCompleteness(descriptions, definedTerms);
    expect(result.warnings.length).toBeGreaterThan(0); // Error is not defined
    expect(result.warnings.some(w => w.includes('Error'))).toBe(true);
    expect(result.warnings.some(w => w.includes('Request'))).toBe(false);
  });
});
