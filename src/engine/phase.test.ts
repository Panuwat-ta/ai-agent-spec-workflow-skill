import fc from 'fast-check';
import { getCurrentPhase, canProceedToNextPhase, notifyPhaseDependencies } from './phase';
import { FileSystem } from './fs';
import { getFeatureSpecPath } from './workflow';
import { WorkflowPhase } from '../types';

describe('Workflow Phase Management', () => {
  const createMockFS = (existingFiles: string[]): FileSystem => {
    const files = new Set(existingFiles);
    return {
      exists: (p: string) => files.has(p),
      readFile: () => '',
      writeFile: () => {},
      mkdir: () => {}
    };
  };

  it('should correctly identify current phase based on existing documents', () => {
    const featureName = 'test-feature';
    const basePath = getFeatureSpecPath(featureName);

    // No files
    expect(getCurrentPhase(featureName, createMockFS([])).currentPhase).toBe('requirements');
    
    // Requirements only
    expect(getCurrentPhase(featureName, createMockFS([`${basePath}/requirements.md`])).currentPhase).toBe('design');
    
    // Requirements + Design
    expect(getCurrentPhase(featureName, createMockFS([`${basePath}/requirements.md`, `${basePath}/design.md`])).currentPhase).toBe('tasks');
    
    // All files
    expect(getCurrentPhase(featureName, createMockFS([`${basePath}/requirements.md`, `${basePath}/design.md`, `${basePath}/tasks.md`])).currentPhase).toBe('build');
  });

  it('should validate phase completion correctly', () => {
    const featureName = 'test-feature';
    const basePath = getFeatureSpecPath(featureName);

    // Missing tasks document
    const missingTasks = createMockFS([`${basePath}/requirements.md`, `${basePath}/design.md`]);
    const result1 = canProceedToNextPhase(featureName, missingTasks);
    expect(result1.isValid).toBe(false);
    expect(result1.errors).toContain('Tasks document is missing or incomplete.');

    // Missing design document
    const missingDesign = createMockFS([`${basePath}/requirements.md`]);
    const result2 = canProceedToNextPhase(featureName, missingDesign);
    expect(result2.isValid).toBe(false);
    expect(result2.errors).toContain('Design document is missing or incomplete.');

    // Missing requirements document
    const missingReq = createMockFS([]);
    const result3 = canProceedToNextPhase(featureName, missingReq);
    expect(result3.isValid).toBe(false);
    expect(result3.errors).toContain('Requirements document is missing or incomplete.');
    
    // All documents present
    const allDocs = createMockFS([`${basePath}/requirements.md`, `${basePath}/design.md`, `${basePath}/tasks.md`]);
    const result4 = canProceedToNextPhase(featureName, allDocs);
    expect(result4.isValid).toBe(true);
    expect(result4.errors.length).toBe(0);
  });

  it('should notify dependent phases when a phase is modified', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('requirements', 'design', 'tasks', 'build') as fc.Arbitrary<WorkflowPhase>,
        (modifiedPhase) => {
          const dependencies = notifyPhaseDependencies(modifiedPhase);
          
          if (modifiedPhase === 'requirements') {
            expect(dependencies).toEqual(['design', 'tasks', 'build']);
          } else if (modifiedPhase === 'design') {
            expect(dependencies).toEqual(['tasks', 'build']);
          } else if (modifiedPhase === 'tasks') {
            expect(dependencies).toEqual(['build']);
          } else if (modifiedPhase === 'build') {
            expect(dependencies).toEqual([]);
          }
        }
      )
    );
  });
});
