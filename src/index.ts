export { initializeWorkflow, WorkflowConfig, getFeatureSpecPath } from './engine/workflow';
export { getCurrentPhase, canProceedToNextPhase, notifyPhaseDependencies, PhaseState } from './engine/phase';
export { validateFeatureName } from './engine/validation';
export { FileSystem, defaultFS } from './engine/fs';

export { generateRequirements, GenerateRequirementsInput } from './generator/requirements';
export { generateDesign, GenerateDesignInput, ComponentData, CorrectnessProperty } from './generator/design';
export { generateTasks, GenerateTasksInput, TaskInput } from './generator/tasks';
export { updateDocument, detectConflictingFeedback, UpdateFeedback } from './generator/updater';

export { validateEARSPatterns, identifyEARSPattern } from './validators/ears';
export { validateGlossaryCompleteness, extractTechnicalTerms } from './validators/glossary';
export { validateQuality, detectVagueTerms, detectPronouns, detectEscapeClauses } from './validators/quality';
export { validateDesignTraceability, validateTasksTraceability, extractRequirementIds } from './validators/traceability';

export { analyzeAcceptanceCriterion, detectRoundTripRequirement, TestRecommendation, TestRecommendationType } from './advisor/pbt';

export * from './types';
