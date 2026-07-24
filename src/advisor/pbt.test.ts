import fc from 'fast-check';
import { analyzeAcceptanceCriterion, detectRoundTripRequirement } from './pbt';

describe('PBT Advisor', () => {
  describe('analyzeAcceptanceCriterion', () => {
    it('should classify integration tests based on keywords', () => {
      const result1 = analyzeAcceptanceCriterion('The system shall connect to AWS S3.');
      expect(result1.type).toBe('integration');
      
      const result2 = analyzeAcceptanceCriterion('Save user data to the database.');
      expect(result2.type).toBe('integration');
    });

    it('should classify smoke tests based on keywords', () => {
      const result = analyzeAcceptanceCriterion('Verify that the environment is configured correctly.');
      expect(result.type).toBe('smoke');
    });

    it('should classify property-based tests based on invariant patterns', () => {
      const result1 = analyzeAcceptanceCriterion('For any valid input, the output must be positive.');
      expect(result1.type).toBe('property');

      const result2 = analyzeAcceptanceCriterion('The operation should guarantee idempotence.');
      expect(result2.type).toBe('property');
    });

    it('should classify edge cases based on boundary keywords', () => {
      const result = analyzeAcceptanceCriterion('If the list is empty, return null.');
      expect(result.type).toBe('edge-case');
    });

    it('should classify untestable requirements', () => {
      const result = analyzeAcceptanceCriterion('The UI should look good as appropriate.');
      expect(result.type).toBe('not-testable');
    });

    it('should default to example-based testing', () => {
      const result = analyzeAcceptanceCriterion('When a user clicks submit, a success message is shown.');
      expect(result.type).toBe('example');
    });
  });

  describe('detectRoundTripRequirement', () => {
    it('should detect parse/serialize round-trip requirements', () => {
      expect(detectRoundTripRequirement('The system should parse and serialize JSON.')).toBe(true);
    });

    it('should detect encode/decode round-trip requirements', () => {
      expect(detectRoundTripRequirement('It must encode and then decode the payload.')).toBe(true);
    });

    it('should detect explicit round-trip keyword', () => {
      expect(detectRoundTripRequirement('Verify the round-trip conversion.')).toBe(true);
    });

    it('should return false for other descriptions', () => {
      expect(detectRoundTripRequirement('Just parse the input.')).toBe(false);
      expect(detectRoundTripRequirement('Serialize data to disk.')).toBe(false);
    });
  });
});
