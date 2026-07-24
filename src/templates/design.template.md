# Design: {{featureName}}

## Overview
{{overview}}

## Architecture
{{architecture}}

## Components
{{#each components}}
### {{name}}
{{description}}
**Interfaces**:
{{interfaces}}
**Algorithms**:
{{algorithms}}
{{/each}}

## Correctness Properties
{{#each properties}}
### Property {{id}}: {{description}}
**Validates**: Requirements {{#each requirementIds}}{{this}} {{/each}}
{{/each}}
