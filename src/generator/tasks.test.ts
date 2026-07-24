import { generateTasks, GenerateTasksInput } from './tasks';
import { FileSystem } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import * as path from 'path';
import * as fs from 'fs';

describe('Tasks Generator', () => {
  const createMockFS = (): FileSystem => {
    const files: Record<string, string> = {};
    const dirs = new Set<string>();
    
    // Add requirements.md and design.md
    files['.specs/test-feature/requirements.md'] = 'REQ';
    files['.specs/test-feature/design.md'] = 'DESIGN';

    // Load templates
    const tasksTemplatePath = path.join(__dirname, '../../src/templates/tasks.template.md');
    let templateContent = '';
    try {
      templateContent = fs.readFileSync(tasksTemplatePath, 'utf8');
    } catch (e) {
      templateContent = '# Tasks\n{{#each tasks}}- [ ] {{id}}\n{{/each}}';
    }

    files[tasksTemplatePath] = templateContent;
    const resolvedPath = path.join(__dirname, '../templates/tasks.template.md');
    files[resolvedPath] = templateContent;

    return {
      exists: (p: string) => files[p] !== undefined || dirs.has(p),
      readFile: (p: string) => files[p] || '',
      writeFile: (p: string, data: string) => { files[p] = data; },
      mkdir: (p: string) => { dirs.add(p); }
    };
  };

  const baseInput: GenerateTasksInput = {
    featureName: 'test-feature',
    overview: 'Tasks overview',
    tasks: [
      {
        id: '1',
        title: 'Task 1',
        subtasks: ['Sub 1'],
        requirementIds: ['REQ-1'],
        designIds: ['Component1'],
        dependencies: []
      },
      {
        id: '2',
        title: 'Task 2',
        subtasks: ['Sub 2'],
        requirementIds: ['REQ-2'],
        designIds: ['Component2'],
        dependencies: ['1']
      }
    ]
  };

  it('should fail if requirements.md or design.md is missing', () => {
    const mockFs = createMockFS();
    mockFs.exists = () => false;
    
    const result = generateTasks(baseInput, mockFs);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Both requirements.md and design.md must exist before generating tasks.');
  });

  it('should generate tasks document and sort topologically', () => {
    const mockFs = createMockFS();
    // Give tasks in reverse dependency order
    const input = JSON.parse(JSON.stringify(baseInput));
    input.tasks = [input.tasks[1], input.tasks[0]];
    
    const result = generateTasks(input, mockFs);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    const specPath = getFeatureSpecPath('test-feature');
    const content = mockFs.readFile(`${specPath}/tasks.md`);
    expect(content).toBeDefined();
    
    // Check order in rendered output: Task 1 should appear before Task 2 
    // because Task 2 depends on Task 1
    const idx1 = content.indexOf('1.');
    const idx2 = content.indexOf('2.');
    expect(idx1).toBeLessThan(idx2);
  });

  it('should detect and fail on circular dependencies', () => {
    const mockFs = createMockFS();
    const input: GenerateTasksInput = {
      ...baseInput,
      tasks: [
        {
          id: '1',
          title: 'Task 1',
          subtasks: [],
          requirementIds: [],
          designIds: [],
          dependencies: ['2']
        },
        {
          id: '2',
          title: 'Task 2',
          subtasks: [],
          requirementIds: [],
          designIds: [],
          dependencies: ['1']
        }
      ]
    };
    
    const result = generateTasks(input, mockFs);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Circular dependency'))).toBe(true);
  });
});
