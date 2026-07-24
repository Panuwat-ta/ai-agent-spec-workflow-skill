import { loadTemplate, renderTemplate } from '../templates/engine';
import { extractTechnicalTerms, validateGlossaryCompleteness } from '../validators/glossary';
import { identifyEARSPattern, validateEARSPatterns } from '../validators/ears';
import { validateQuality } from '../validators/quality';
import { FileSystem, defaultFS } from '../engine/fs';
import { getFeatureSpecPath } from '../engine/workflow';
import { ValidationResult } from '../types';

export interface GenerateRequirementsInput {
  featureName: string;
  description: string;
  glossary: { term: string; definition: string }[];
  requirements: any[];
}

export function generateRequirements(
  input: GenerateRequirementsInput,
  fs: FileSystem = defaultFS,
  customTemplatePath?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Sort glossary alphabetically
  input.glossary.sort((a, b) => a.term.localeCompare(b.term));

  const definedTerms = input.glossary.map(g => g.term);
  const requirementDescriptions = input.requirements.flatMap(req => 
    [req.description, ...req.acceptanceCriteria.map((ac: any) => ac.description)]
  );

  // Validate Glossary
  const glossaryValidation = validateGlossaryCompleteness(requirementDescriptions, definedTerms);
  warnings.push(...glossaryValidation.warnings);

  // Validate EARS Patterns
  const criteriaDescriptions = input.requirements.flatMap(req => 
    req.acceptanceCriteria.map((ac: any) => ac.description)
  );
  
  // Assign patterns to criteria
  input.requirements.forEach(req => {
    req.acceptanceCriteria.forEach((ac: any) => {
      ac.pattern = identifyEARSPattern(ac.description);
    });
  });

  const earsValidation = validateEARSPatterns(criteriaDescriptions);
  errors.push(...earsValidation.errors);

  // Validate Quality
  const qualityValidation = validateQuality(requirementDescriptions);
  warnings.push(...qualityValidation.warnings);

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  try {
    const template = loadTemplate('requirements', customTemplatePath, fs);
    const content = renderTemplate(template, input);
    
    const specPath = getFeatureSpecPath(input.featureName);
    fs.mkdir(specPath);
    fs.writeFile(`${specPath}/requirements.md`, content);
    
    return { isValid: true, errors: [], warnings };
  } catch (error: any) {
    return { isValid: false, errors: [`Failed to generate requirements: ${error.message}`], warnings };
  }
}
