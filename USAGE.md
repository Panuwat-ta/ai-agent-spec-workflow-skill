# Usage Guide for AI Agents

When building features with this codebase, you must follow the `Spec -> Plan -> Build` workflow. Do not write implementation code until the specification is complete.

## Workflow Phases

### Phase 1: Requirements (`requirements.md`)
1. Create a glossary of technical terms.
2. Define user stories.
3. Write acceptance criteria. The criteria must follow EARS patterns.
4. Call `generateRequirements()` to scaffold the document.

### Phase 2: Design (`design.md`)
1. Break down the system into components.
2. Define interfaces and algorithms.
3. Write correctness properties that reference the requirement IDs.
4. Call `generateDesign()` to generate the design document.

### Phase 3: Tasks (`tasks.md`)
1. Create a checklist of tasks.
2. Each task must reference components from the design document.
3. Tasks must be topologically sorted.
4. Call `generateTasks()` to generate the checklist.

## Validation Failures

If you encounter validation failures (e.g., vague terms or undefined glossary items):
- Fix the textual descriptions and re-run the generator.
- Check the `warnings` array in the `ValidationResult` to improve the quality of your specifications.
