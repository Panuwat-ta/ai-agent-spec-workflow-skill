import { loadTemplate, renderTemplate } from '../templates/engine';
import { FileSystem, defaultFS } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import { ValidationResult } from '../types';
import { extractRequirementIds } from '../validators/traceability';

export interface ComponentData {
  name: string;
  description: string;
  interfaces: string;
  algorithms: string;
}

export interface CorrectnessProperty {
  id: string;
  description: string;
  requirementIds: string[];
}

export interface GenerateDesignInput {
  featureName: string;
  overview: string;
  architecture: string;
  components: ComponentData[];
  properties: CorrectnessProperty[];
}

export function generateDesign(
  input: GenerateDesignInput,
  fs: FileSystem = defaultFS,
  customTemplatePath?: string
): ValidationResult {
  const specPath = getFeatureSpecPath(input.featureName);
  const reqPath = `${specPath}/requirements.md`;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.exists(reqPath)) {
    return {
      isValid: false,
      errors: ['Requirements document (requirements.md) must exist before generating design.'],
      warnings: []
    };
  }

  const reqContent = fs.readFile(reqPath);
  const validReqIds = extractRequirementIds(reqContent);

  // Validate properties trace to valid requirement IDs
  input.properties.forEach(prop => {
    prop.requirementIds.forEach(reqId => {
      if (!validReqIds.includes(reqId)) {
        errors.push(`Property ${prop.id} references unknown requirement ID: "${reqId}"`);
      }
    });
  });

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  try {
    const template = loadTemplate('design', customTemplatePath, fs);
    const content = renderTemplate(template, input);
    
    fs.mkdir(specPath);
    fs.writeFile(`${specPath}/design.md`, content);
    
    return { isValid: true, errors: [], warnings };
  } catch (error: any) {
    return { isValid: false, errors: [`Failed to generate design: ${error.message}`], warnings };
  }
}
