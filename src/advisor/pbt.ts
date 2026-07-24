export type TestRecommendationType = 
  | 'property' 
  | 'example' 
  | 'edge-case' 
  | 'integration' 
  | 'smoke' 
  | 'not-testable';

export interface TestRecommendation {
  type: TestRecommendationType;
  reason: string;
}

export function analyzeAcceptanceCriterion(description: string): TestRecommendation {
  const normalized = description.toLowerCase();

  // Integration test keywords
  const integrationKeywords = ['aws', 'cloudwatch', 's3', 'api', 'database', 'external', 'service'];
  if (integrationKeywords.some(kw => normalized.includes(kw))) {
    return {
      type: 'integration',
      reason: 'Contains keywords suggesting external dependencies or infrastructure.'
    };
  }

  // Smoke test keywords
  const smokeKeywords = ['configured', 'enabled', 'permissions', 'environment', 'deployed'];
  if (smokeKeywords.some(kw => normalized.includes(kw))) {
    return {
      type: 'smoke',
      reason: 'Contains keywords suggesting environment configuration or basic health checks.'
    };
  }

  // Property-based test patterns
  const pbtPatterns = ['for any', 'for all', 'invariant', 'round-trip', 'idempotence', 'symmetric', 'always'];
  if (pbtPatterns.some(pattern => normalized.includes(pattern))) {
    return {
      type: 'property',
      reason: 'Contains universal quantifiers or invariant patterns suitable for property-based testing.'
    };
  }

  // Not testable / ambiguous
  const notTestableKeywords = ['look good', 'fast', 'user-friendly', 'as appropriate', 'tbd'];
  if (notTestableKeywords.some(kw => normalized.includes(kw))) {
    return {
      type: 'not-testable',
      reason: 'Contains vague or untestable terms.'
    };
  }

  // Edge cases
  const edgeCaseKeywords = ['boundary', 'maximum', 'minimum', 'empty', 'null', 'timeout'];
  if (edgeCaseKeywords.some(kw => normalized.includes(kw))) {
    return {
      type: 'edge-case',
      reason: 'Specifically mentions boundary or failure conditions.'
    };
  }

  // Default to example-based testing
  return {
    type: 'example',
    reason: 'Standard functional requirement best suited for example-based unit testing.'
  };
}

export function detectRoundTripRequirement(description: string): boolean {
  const normalized = description.toLowerCase();
  return (
    (normalized.includes('parse') && normalized.includes('serialize')) ||
    (normalized.includes('encode') && normalized.includes('decode')) ||
    normalized.includes('round-trip')
  );
}
