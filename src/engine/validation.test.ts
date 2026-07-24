import fc from 'fast-check';
import { validateFeatureName } from './validation';

describe('Feature Name Validation', () => {
  it('should accept valid kebab-case names', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (parts) => {
          const name = parts.join('-');
          const result = validateFeatureName(name);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      )
    );
  });

  it('should reject names with uppercase letters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => /[A-Z]/.test(s) && !/\s/.test(s)),
        (name) => {
          const result = validateFeatureName(name);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('Feature name must be lowercase.');
        }
      )
    );
  });

  it('should reject names with spaces', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => /\s/.test(s) && s.trim() !== ''),
        (name) => {
          const result = validateFeatureName(name);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('Feature name cannot contain spaces.');
        }
      )
    );
  });

  it('should reject names starting or ending with hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)),
        (validName) => {
          const startResult = validateFeatureName('-' + validName);
          expect(startResult.isValid).toBe(false);
          expect(startResult.errors).toContain('Feature name cannot start or end with a hyphen.');

          const endResult = validateFeatureName(validName + '-');
          expect(endResult.isValid).toBe(false);
          expect(endResult.errors).toContain('Feature name cannot start or end with a hyphen.');
        }
      )
    );
  });

  it('should reject empty names', () => {
    const result = validateFeatureName('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Feature name cannot be empty.');
  });
});
