import fc from 'fast-check';
import { extractRequirementIds, validateDesignTraceability, validateTasksTraceability } from './traceability';

describe('Traceability Validator', () => {
  describe('extractRequirementIds', () => {
    it('should extract requirement IDs correctly', () => {
      const content = `
# Requirements
### 1.1: Authentication
Desc
### REQ-2: Authorization
Desc
### 3.1 Setup
Desc
`;
      const ids = extractRequirementIds(content);
      expect(ids).toEqual(['1.1', 'REQ-2', '3.1']);
    });
  });

  describe('validateDesignTraceability', () => {
    it('should validate correctly when all requirements are covered and valid', () => {
      const reqIds = ['1.1', '1.2'];
      const designContent = `
## Correctness Properties
### Property 1
**Validates**: Requirements 1.1, 1.2
`;
      const result = validateDesignTraceability(designContent, reqIds);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should error when referencing unknown requirements', () => {
      const reqIds = ['1.1'];
      const designContent = `
**Validates**: Requirements 1.1, 2.1
`;
      const result = validateDesignTraceability(designContent, reqIds);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('2.1'))).toBe(true);
    });

    it('should warn when requirements are not covered', () => {
      const reqIds = ['1.1', '1.2'];
      const designContent = `
**Validates**: Requirements 1.1
`;
      const result = validateDesignTraceability(designContent, reqIds);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('1.2'))).toBe(true);
    });
  });

  describe('validateTasksTraceability', () => {
    const designContent = `
## Components
### AuthComponent
Desc
### Database
Desc
`;

    it('should validate correctly when all components are covered and valid', () => {
      const tasksContent = `
- [ ] 1. Setup Auth
  - _Design: AuthComponent, Database_
`;
      const result = validateTasksTraceability(tasksContent, designContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should error when referencing unknown design components', () => {
      const tasksContent = `
- [ ] 1. Setup UI
  - _Design: UIComponent_
`;
      const result = validateTasksTraceability(tasksContent, designContent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('UIComponent'))).toBe(true);
    });

    it('should warn when design components are not covered', () => {
      const tasksContent = `
- [ ] 1. Setup Auth
  - _Design: AuthComponent_
`;
      const result = validateTasksTraceability(tasksContent, designContent);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Database'))).toBe(true);
    });
  });
});
