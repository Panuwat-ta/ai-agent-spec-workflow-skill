# Requirements: {{featureName}}

## Introduction
{{description}}

## Glossary
{{#each glossary}}
- **{{term}}**: {{definition}}
{{/each}}

## Requirements
{{#each requirements}}
### {{id}}: {{title}}
{{description}}

{{#if userStory}}
**User Story**: As a {{userStory.role}}, I want to {{userStory.action}}, so that {{userStory.benefit}}.
{{/if}}

**Acceptance Criteria**:
{{#each acceptanceCriteria}}
- {{id}}: {{description}} (Pattern: {{pattern}})
{{/each}}
{{/each}}
