import { v4 as uuidv4 } from 'uuid';
import { validateFeatureName } from './validation';
import { FileSystem, defaultFS } from './fs';
import { WorkflowResult } from '../types';

export interface WorkflowConfig {
  specId: string;
  workflowType: string;
  specType: string;
  featureName: string;
}

export function getFeatureSpecPath(featureName: string): string {
  return `.specs/${featureName}`;
}

export function initializeWorkflow(
  featureName: string, 
  fs: FileSystem = defaultFS
): WorkflowResult<WorkflowConfig> {
  const validation = validateFeatureName(featureName);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings
    };
  }

  const specId = uuidv4();
  const specPath = getFeatureSpecPath(featureName);
  const configPath = `${specPath}/.config.agent`;

  const config: WorkflowConfig = {
    specId,
    workflowType: 'standard',
    specType: 'feature',
    featureName
  };

  try {
    fs.mkdir(specPath);
    fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    return {
      success: true,
      data: config
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [`Failed to initialize workflow: ${error.message}`]
    };
  }
}
