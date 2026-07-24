export type WorkflowPhase = 'requirements' | 'design' | 'tasks' | 'build';

export interface WorkflowResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UserStory {
  role: string;
  action: string;
  benefit: string;
}

export type EARSPattern = 
  | 'ubiquitous' 
  | 'event-driven' 
  | 'state-driven' 
  | 'unwanted-event' 
  | 'optional' 
  | 'complex'
  | 'unknown';

export interface AcceptanceCriterion {
  id: string;
  description: string;
  pattern: EARSPattern;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  userStory?: UserStory;
  acceptanceCriteria: AcceptanceCriterion[];
}

export interface DesignInput {
  requirements: Requirement[];
  architecture: string;
  components: any[];
}

export interface TasksInput {
  design: any;
  tasks: any[];
}

export interface Property {
  id: string;
  description: string;
  requirementIds: string[];
}
