import { FileSystem, defaultFS } from './fs';
import { WorkflowPhase, ValidationResult } from '../types';
import { WorkflowConfig, getFeatureSpecPath } from './workflow';

export interface PhaseState {
  currentPhase: WorkflowPhase;
  completedPhases: WorkflowPhase[];
}

export function getCurrentPhase(
  featureName: string, 
  fs: FileSystem = defaultFS
): PhaseState {
  const specPath = getFeatureSpecPath(featureName);
  
  const hasRequirements = fs.exists(`${specPath}/requirements.md`);
  const hasDesign = fs.exists(`${specPath}/design.md`);
  const hasTasks = fs.exists(`${specPath}/tasks.md`);

  const completedPhases: WorkflowPhase[] = [];
  let currentPhase: WorkflowPhase = 'requirements';

  if (hasRequirements) {
    completedPhases.push('requirements');
    currentPhase = 'design';
  }
  
  if (hasRequirements && hasDesign) {
    completedPhases.push('design');
    currentPhase = 'tasks';
  }
  
  if (hasRequirements && hasDesign && hasTasks) {
    completedPhases.push('tasks');
    currentPhase = 'build';
  }

  return {
    currentPhase,
    completedPhases
  };
}

export function canProceedToNextPhase(
  featureName: string,
  fs: FileSystem = defaultFS
): ValidationResult {
  const state = getCurrentPhase(featureName, fs);
  const errors: string[] = [];

  if (state.currentPhase === 'requirements') {
    errors.push('Requirements document is missing or incomplete.');
  } else if (state.currentPhase === 'design') {
    errors.push('Design document is missing or incomplete.');
  } else if (state.currentPhase === 'tasks') {
    errors.push('Tasks document is missing or incomplete.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

export function notifyPhaseDependencies(
  modifiedPhase: WorkflowPhase
): WorkflowPhase[] {
  const dependencies: Record<WorkflowPhase, WorkflowPhase[]> = {
    'requirements': ['design', 'tasks', 'build'],
    'design': ['tasks', 'build'],
    'tasks': ['build'],
    'build': []
  };

  return dependencies[modifiedPhase] || [];
}
