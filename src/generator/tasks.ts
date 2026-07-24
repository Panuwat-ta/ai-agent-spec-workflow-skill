import { loadTemplate, renderTemplate } from '../templates/engine';
import { FileSystem, defaultFS } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import { ValidationResult } from '../types';

export interface TaskInput {
  id: string;
  title: string;
  subtasks: string[];
  isTest?: boolean;
  requirementIds: string[];
  designIds: string[];
  dependencies: string[]; // List of Task IDs this task depends on
}

export interface GenerateTasksInput {
  featureName: string;
  overview: string;
  tasks: TaskInput[];
}

function topologicalSort(tasks: TaskInput[]): { sorted: TaskInput[], cycles: string[][] } {
  const sorted: TaskInput[] = [];
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const path: string[] = [];

  const taskMap = new Map<string, TaskInput>();
  tasks.forEach(t => taskMap.set(t.id, t));

  function visit(taskId: string) {
    if (visiting.has(taskId)) {
      // Cycle detected
      const cycleStart = path.indexOf(taskId);
      cycles.push([...path.slice(cycleStart), taskId]);
      return;
    }
    
    if (visited.has(taskId)) return;

    visiting.add(taskId);
    path.push(taskId);

    const task = taskMap.get(taskId);
    if (task && task.dependencies) {
      task.dependencies.forEach(depId => {
        if (taskMap.has(depId)) {
          visit(depId);
        }
      });
    }

    path.pop();
    visiting.delete(taskId);
    visited.add(taskId);
    if (task) {
      sorted.push(task);
    }
  }

  tasks.forEach(t => {
    if (!visited.has(t.id)) {
      visit(t.id);
    }
  });

  return { sorted, cycles };
}

export function generateTasks(
  input: GenerateTasksInput,
  fs: FileSystem = defaultFS,
  customTemplatePath?: string
): ValidationResult {
  const specPath = getFeatureSpecPath(input.featureName);
  const reqPath = `${specPath}/requirements.md`;
  const designPath = `${specPath}/design.md`;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.exists(reqPath) || !fs.exists(designPath)) {
    return {
      isValid: false,
      errors: ['Both requirements.md and design.md must exist before generating tasks.'],
      warnings: []
    };
  }

  const { sorted, cycles } = topologicalSort(input.tasks);

  if (cycles.length > 0) {
    cycles.forEach(cycle => {
      errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`);
    });
    return { isValid: false, errors, warnings };
  }

  // Update input with sorted tasks
  input.tasks = sorted;

  try {
    const template = loadTemplate('tasks', customTemplatePath, fs);
    const content = renderTemplate(template, input);
    
    fs.mkdir(specPath);
    fs.writeFile(`${specPath}/tasks.md`, content);
    
    return { isValid: true, errors: [], warnings };
  } catch (error: any) {
    return { isValid: false, errors: [`Failed to generate tasks: ${error.message}`], warnings };
  }
}
