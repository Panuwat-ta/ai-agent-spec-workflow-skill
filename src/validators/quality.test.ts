import fc from 'fast-check';
import { detectVagueTerms, detectPronouns, detectEscapeClauses, validateQuality } from './quality';

describe('Quality Validator', () => {
  it('should detect vague terms', () => {
    const vagueTerms = [
      'tbd', 'appropriate', 'as needed', 'flexible', 'user-friendly', 
      'robust', 'fast', 'seamless', 'easy to use', 'state of the art'
    ];
    
    vagueTerms.forEach(term => {
      const sentence = `The system shall be ${term}.`;
      const warnings = detectVagueTerms(sentence, 0);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain(term);
    });
  });

  it('should not detect false positives for vague terms', () => {
    const cleanSentence = 'The system shall respond within 500ms.';
    const warnings = detectVagueTerms(cleanSentence, 0);
    expect(warnings).toHaveLength(0);
  });

  it('should detect ambiguous pronouns', () => {
    const pronouns = ['it', 'they', 'this', 'that', 'these', 'those'];
    
    pronouns.forEach(pronoun => {
      // Testing with a space to avoid false positives inside other words
      const sentence = `When an error occurs, ${pronoun} shall be logged.`;
      const warnings = detectPronouns(sentence, 0);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain(pronoun);
    });
  });

  it('should not detect pronouns embedded in other words', () => {
    const sentence = 'The item shall be processed.'; // 'item' contains 'it'
    const warnings = detectPronouns(sentence, 0);
    expect(warnings).toHaveLength(0);
  });

  it('should detect escape clauses', () => {
    const clauses = [
      'if possible', 'as appropriate', 'to the extent possible', 
      'where applicable', 'as a minimum', 'but not limited to'
    ];
    
    clauses.forEach(clause => {
      const sentence = `The system shall retry ${clause}.`;
      const warnings = detectEscapeClauses(sentence, 0);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain(clause);
    });
  });

  it('should validate an array of descriptions correctly', () => {
    const valid = [
      'The system shall initialize components within 1 second.',
      'When triggered, the system shall act immediately.'
    ];
    
    const invalid = [
      'It should be fast as appropriate.',
      'TBD'
    ];

    expect(validateQuality(valid).warnings).toHaveLength(0);
    expect(validateQuality(invalid).warnings.length).toBeGreaterThan(0);
  });
});
