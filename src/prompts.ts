export function getRequirementsPrompt(featureName: string, contextContent: string): string {
  return `# Requirements: ${featureName}

> **@AI INSTRUCTION:**
> You are an elite enterprise product manager. Based on the project context below, write an extremely detailed and comprehensive requirements document for the "${featureName}" feature.
> Your output MUST be highly professional, structured, and cover all edge cases.
>
> **Required Output Structure:**
> 1. **Introduction**: Detailed overview of the feature's purpose and scope.
> 2. **Glossary**: Define any technical terms, acronyms, or specific domain language.
> 3. **Requirements**: 
>    - Break down into logical groups (e.g., Requirement 1: Authentication, Requirement 2: Profile).
>    - For each requirement, write a **User Story** ("As a [role], I want [action], so that [benefit]").
>    - For each story, provide 5+ exhaustive **Acceptance Criteria** using strict \`GIVEN/WHEN/THEN\` or \`SHALL/SHALL NOT\` formats.
> 4. **Non-functional Requirements**: Performance metrics, security constraints, offline behaviors, error handling.
>
> [Please replace this entire block with your highly detailed generated requirements]

---

<details>
<summary>📁 Project Context (click to expand)</summary>

${contextContent}

</details>
`;
}

export function getDesignPrompt(featureName: string, requirementsContent: string): string {
  return `# Design: ${featureName}

> **@AI INSTRUCTION:**
> You are a senior principal software architect. Based on the approved requirements below, write an exhaustive, enterprise-grade technical design document for the "${featureName}" feature.
> Your design MUST be deep, covering exact implementation details, not just high-level concepts.
>
> **Required Output Structure:**
> 1. **Overview**: Executive summary of the technical approach and core tech stack.
> 2. **Architecture**: High-level architecture, layer separation (Presentation, Business, Data). Use text-based diagrams if helpful.
> 3. **Component Design**: Detailed breakdown of every class, service, controller, and module required. Include function signatures or interfaces.
> 4. **Data Model / Schema**: Exact database tables, columns, types, and relationships.
> 5. **API Contracts / Interfaces**: Detailed endpoints, JSON request/response bodies, HTTP methods, and status codes.
> 6. **State Management / Workflows**: State machines or complex logic flows.
> 7. **Security & Error Handling**: How exceptions and edge cases are handled.
>
> [Please replace this entire block with your highly detailed generated design]

---

<details>
<summary>📋 Approved Requirements (click to expand)</summary>

${requirementsContent}

</details>
`;
}

export function getTasksPrompt(featureName: string, designContent: string): string {
  return `# Tasks: ${featureName}

> **@AI INSTRUCTION:**
> You are a lead software engineer. Based on the approved design below, break down the implementation into an exhaustive, granular, step-by-step checklist.
>
> **Required Output Structure:**
> - Use exact markdown checklists: \`- [ ]\` for pending tasks.
> - Group tasks logically by architectural layer (e.g., Database Layer, API Layer, UI Layer).
> - Sequence tasks strictly by dependency (what MUST be built first).
> - Tasks must be extremely granular (no more than 1-2 hours of work per task).
> - Mention specific file names, classes, or functions to be created in each task.
>
> [Please replace this entire block with your highly detailed task checklist]

> **🚨 @AI INSTRUCTION FOR IMPLEMENTATION PHASE:**
> When the user asks you to start coding, you MUST strictly keep this file updated.
> Change \`- [ ]\` to \`- [x]\` as soon as you finish each task. Do not wait until the end.

---

<details>
<summary>📐 Approved Design (click to expand)</summary>

${designContent}

</details>
`;
}
