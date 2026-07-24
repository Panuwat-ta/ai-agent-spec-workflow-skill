import { 
  initializeWorkflow, 
  generateRequirements, 
  generateDesign, 
  generateTasks,
  FileSystem
} from './index';
import * as path from 'path';
import * as fs from 'fs';

describe('Skill Integration', () => {
  const createMockFS = (): FileSystem => {
    const files: Record<string, string> = {};
    const dirs = new Set<string>();
    
    // Preload templates
    const templates = ['requirements', 'design', 'tasks'];
    templates.forEach(t => {
      const templatePath = path.join(__dirname, `../src/templates/${t}.template.md`);
      let content = '';
      try {
        content = fs.readFileSync(templatePath, 'utf8');
      } catch (e) {
        // basic mock
        if (t === 'requirements') content = '# Requirements: {{featureName}}\n{{#each glossary}}{{term}}{{/each}}\n{{#each requirements}}### {{id}}\n{{description}}{{/each}}';
        if (t === 'design') content = '# Design: {{featureName}}\n{{#each components}}### {{name}}{{/each}}\n## Correctness Properties\n{{#each properties}}**Validates**: Requirements {{#each requirementIds}}{{this}} {{/each}}{{/each}}';
        if (t === 'tasks') content = '# Tasks\n{{#each tasks}}- [ ] {{id}}\n  - _Design: {{#each designIds}}{{this}} {{/each}}_{{/each}}';
      }
      files[templatePath] = content;
      files[path.join(__dirname, `templates/${t}.template.md`)] = content;
    });

    return {
      exists: (p: string) => files[p] !== undefined || dirs.has(p),
      readFile: (p: string) => {
        if (files[p] === undefined) throw new Error(`File not found: ${p}`);
        return files[p];
      },
      writeFile: (p: string, data: string) => { files[p] = data; },
      mkdir: (p: string) => { dirs.add(p); }
    };
  };

  it('should successfully run the complete workflow', () => {
    const mockFs = createMockFS();
    const featureName = 'auth-system';

    // 1. Initialize Workflow
    const initResult = initializeWorkflow(featureName, mockFs);
    expect(initResult.success).toBe(true);
    expect(mockFs.exists(`.specs/${featureName}/.config.agent`)).toBe(true);

    // 2. Generate Requirements
    const reqInput = {
      featureName,
      description: 'The auth system',
      glossary: [{ term: 'Token', definition: 'JWT' }],
      requirements: [{
        id: 'REQ-1',
        title: 'Login',
        description: 'The system shall issue a Token.',
        acceptanceCriteria: [
          { id: 'AC-1.1', description: 'When logged in, the system shall issue a Token.' }
        ]
      }]
    };
    const reqResult = generateRequirements(reqInput, mockFs);
    expect(reqResult.isValid).toBe(true);
    expect(mockFs.exists(`.specs/${featureName}/requirements.md`)).toBe(true);

    // 3. Generate Design
    const designInput = {
      featureName,
      overview: 'Overview',
      architecture: 'Arch',
      components: [
        { name: 'AuthService', description: 'Handles auth', interfaces: 'login', algorithms: 'none' }
      ],
      properties: [
        { id: '1', description: 'Issues token', requirementIds: ['REQ-1'] }
      ]
    };
    const designResult = generateDesign(designInput, mockFs);
    expect(designResult.isValid).toBe(true);
    expect(mockFs.exists(`.specs/${featureName}/design.md`)).toBe(true);

    // 4. Generate Tasks
    const tasksInput = {
      featureName,
      overview: 'Tasks',
      tasks: [
        {
          id: '1',
          title: 'Implement AuthService',
          subtasks: ['Write code'],
          requirementIds: ['REQ-1'],
          designIds: ['AuthService'],
          dependencies: []
        }
      ]
    };
    const tasksResult = generateTasks(tasksInput, mockFs);
    expect(tasksResult.isValid).toBe(true);
    expect(mockFs.exists(`.specs/${featureName}/tasks.md`)).toBe(true);
  });
});
