# Implementation Plan: {{featureName}}

## Overview
{{overview}}

## Tasks

{{#each tasks}}
- [ ] {{id}}. {{title}}
{{#each subtasks}}
  - {{#if isTest}}* {{/if}}{{this}}
{{/each}}
  - _Requirements: {{#each requirementIds}}{{this}} {{/each}}_
  - _Design: {{#each designIds}}{{this}} {{/each}}_

{{/each}}
