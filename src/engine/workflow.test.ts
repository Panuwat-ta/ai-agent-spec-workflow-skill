import fc from 'fast-check';
import { initializeWorkflow, getFeatureSpecPath, WorkflowConfig } from './workflow';
import { FileSystem } from './fs';

describe('Workflow Initialization', () => {
  // Mock FileSystem
  const createMockFS = (): FileSystem => {
    const files: Record<string, string> = {};
    const dirs = new Set<string>();
    return {
      exists: (p: string) => files[p] !== undefined || dirs.has(p),
      readFile: (p: string) => files[p] || '',
      writeFile: (p: string, data: string) => { files[p] = data; },
      mkdir: (p: string) => { dirs.add(p); }
    };
  };

  it('should initialize workflow for valid feature names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && !s.startsWith('-') && !s.endsWith('-') && !s.includes('--')),
        (featureName) => {
          const mockFs = createMockFS();
          const result = initializeWorkflow(featureName, mockFs);

          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();

          const config = result.data as WorkflowConfig;
          expect(config.specId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
          expect(config.featureName).toBe(featureName);
          expect(config.workflowType).toBe('standard');
          expect(config.specType).toBe('feature');

          const specPath = getFeatureSpecPath(featureName);
          expect(mockFs.exists(specPath)).toBe(true);
          
          const configPath = `${specPath}/.config.agent`;
          const writtenConfig = JSON.parse(mockFs.readFile(configPath));
          expect(writtenConfig).toEqual(config);
        }
      )
    );
  });

  it('should generate correct file paths', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && !s.startsWith('-') && !s.endsWith('-') && !s.includes('--')),
        (featureName) => {
          const path = getFeatureSpecPath(featureName);
          expect(path).toBe(`.specs/${featureName}`);
        }
      )
    );
  });

  it('should reject invalid feature names', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => /\s/.test(s) || /[A-Z]/.test(s) || s === ''),
        (invalidName) => {
          const mockFs = createMockFS();
          const result = initializeWorkflow(invalidName, mockFs);
          expect(result.success).toBe(false);
          expect(result.errors && result.errors.length > 0).toBe(true);
        }
      )
    );
  });
});
