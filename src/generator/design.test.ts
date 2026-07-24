import { generateDesign, GenerateDesignInput } from './design';
import { FileSystem } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import * as path from 'path';
import * as fs from 'fs';

describe('Design Generator', () => {
  const createMockFS = (reqContent: string = '### REQ-1: Test\nDesc'): FileSystem => {
    const files: Record<string, string> = {};
    const dirs = new Set<string>();
    
    // Add requirements.md
    files[`.specs/test-feature/requirements.md`] = reqContent;

    // Load templates
    const designTemplatePath = path.join(__dirname, '../../src/templates/design.template.md');
    let templateContent = '';
    try {
      templateContent = fs.readFileSync(designTemplatePath, 'utf8');
    } catch (e) {
      templateContent = '# Design: {{featureName}}\n\n## Correctness Properties\n{{#each properties}}Property {{id}}\n{{/each}}';
    }

    files[designTemplatePath] = templateContent;
    const resolvedPath = path.join(__dirname, '../templates/design.template.md');
    files[resolvedPath] = templateContent;

    return {
      exists: (p: string) => files[p] !== undefined || dirs.has(p),
      readFile: (p: string) => files[p] || '',
      writeFile: (p: string, data: string) => { files[p] = data; },
      mkdir: (p: string) => { dirs.add(p); }
    };
  };

  const validInput: GenerateDesignInput = {
    featureName: 'test-feature',
    overview: 'Design overview',
    architecture: 'Design architecture',
    components: [
      {
        name: 'AuthComponent',
        description: 'Handles auth',
        interfaces: 'IAuth',
        algorithms: 'JWT'
      }
    ],
    properties: [
      {
        id: '1',
        description: 'Should authenticate',
        requirementIds: ['REQ-1']
      }
    ]
  };

  it('should fail if requirements.md is missing', () => {
    const mockFs = createMockFS();
    // Delete requirements.md
    mockFs.readFile = () => { throw new Error(); };
    mockFs.exists = (p: string) => p !== '.specs/test-feature/requirements.md';
    
    const result = generateDesign(validInput, mockFs);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Requirements document (requirements.md) must exist before generating design.');
  });

  it('should generate design document successfully with valid input', () => {
    const mockFs = createMockFS();
    const result = generateDesign(validInput, mockFs);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    const specPath = getFeatureSpecPath('test-feature');
    const content = mockFs.readFile(`${specPath}/design.md`);
    expect(content).toBeDefined();
    expect(content).toContain('AuthComponent');
    expect(content).toContain('Property 1');
  });

  it('should fail if a property references an unknown requirement ID', () => {
    const invalidInput = JSON.parse(JSON.stringify(validInput));
    invalidInput.properties[0].requirementIds = ['REQ-999'];
    
    const mockFs = createMockFS();
    const result = generateDesign(invalidInput, mockFs);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('REQ-999'))).toBe(true);
  });
});
