import { generateRequirements, GenerateRequirementsInput } from './requirements';
import { FileSystem } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import * as path from 'path';
import * as fs from 'fs';

describe('Requirements Generator', () => {
  const createMockFS = (): FileSystem => {
    const files: Record<string, string> = {};
    const dirs = new Set<string>();
    
    // Pre-load actual templates to avoid loadTemplate errors
    const reqTemplatePath = path.join(__dirname, '../../src/templates/requirements.template.md');
    let templateContent = '';
    try {
      templateContent = fs.readFileSync(reqTemplatePath, 'utf8');
    } catch (e) {
      // Mock it if actual file can't be read in test environment
      templateContent = '# Requirements: {{featureName}}\n\n## Glossary\n{{#each glossary}}- **{{term}}**: {{definition}}\n{{/each}}';
    }

    // Support both POSIX and Windows paths for the mock
    files[reqTemplatePath] = templateContent;
    // We also mock the __dirname resolved path inside engine.ts which is src/templates
    const resolvedPath = path.join(__dirname, '../templates/requirements.template.md');
    files[resolvedPath] = templateContent;

    return {
      exists: (p: string) => files[p] !== undefined || dirs.has(p),
      readFile: (p: string) => files[p] || '',
      writeFile: (p: string, data: string) => { files[p] = data; },
      mkdir: (p: string) => { dirs.add(p); }
    };
  };

  const validInput: GenerateRequirementsInput = {
    featureName: 'login',
    description: 'System login functionality',
    glossary: [
      { term: 'User', definition: 'A person using the system' },
      { term: 'Credentials', definition: 'Username and password' }
    ],
    requirements: [
      {
        id: 'REQ-1',
        title: 'User Login',
        description: 'The system shall allow the User to login with Credentials.',
        userStory: {
          role: 'User',
          action: 'login',
          benefit: 'access my account'
        },
        acceptanceCriteria: [
          {
            id: 'AC-1.1',
            description: 'When the User enters valid Credentials, the system shall authenticate them.'
          }
        ]
      }
    ]
  };

  it('should generate requirements document successfully with valid input', () => {
    const mockFs = createMockFS();
    const result = generateRequirements(validInput, mockFs);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    const specPath = getFeatureSpecPath('login');
    const content = mockFs.readFile(`${specPath}/requirements.md`);
    expect(content).toBeDefined();
    expect(content).toContain('User');
    expect(content).toContain('Credentials');
  });

  it('should fail when EARS patterns are invalid', () => {
    const invalidInput = JSON.parse(JSON.stringify(validInput));
    invalidInput.requirements[0].acceptanceCriteria[0].description = 'It does something randomly.';
    
    const mockFs = createMockFS();
    const result = generateRequirements(invalidInput, mockFs);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should warn when vague terms are used', () => {
    const warningInput = JSON.parse(JSON.stringify(validInput));
    warningInput.requirements[0].description = 'The system shall be fast and flexible.';
    
    const mockFs = createMockFS();
    const result = generateRequirements(warningInput, mockFs);
    
    expect(result.isValid).toBe(true); // Warnings don't fail generation
    expect(result.warnings.some(w => w.includes('fast') || w.includes('flexible'))).toBe(true);
  });
});
