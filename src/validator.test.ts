import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { validateRequirements, validateDesign, validateTasks } from './validator';

describe('Validator', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('validateRequirements', () => {
    it('should fail if file does not exist', () => {
      const result = validateRequirements(path.join(tmpDir, 'nope.md'));
      expect(result.isValid).toBe(false);
    });

    it('should fail if file still has template placeholder', () => {
      const filePath = path.join(tmpDir, 'requirements.md');
      fs.writeFileSync(filePath, '# Requirements\n\n> [Please replace this block with your generated requirements]\n');
      const result = validateRequirements(filePath);
      expect(result.isValid).toBe(false);
      expect(result.warnings[0]).toContain('template placeholder');
    });

    it('should pass with real content', () => {
      const filePath = path.join(tmpDir, 'requirements.md');
      fs.writeFileSync(filePath, '# Requirements: login\n\n## User Stories\n\nAs a user, I want to log in with my email and password so that I can access my account.\n\n## Acceptance Criteria\n\nGIVEN a registered user\nWHEN they enter valid credentials\nTHEN they should be redirected to the dashboard\n');
      const result = validateRequirements(filePath);
      expect(result.isValid).toBe(true);
    });

    it('should give tip if no GIVEN/WHEN/THEN found', () => {
      const filePath = path.join(tmpDir, 'requirements.md');
      fs.writeFileSync(filePath, '# Requirements: login\n\nThe system shall allow users to log in with email and password. The login form must include validation for both fields and display appropriate error messages if invalid data is submitted by the end user into the form.\n');
      const result = validateRequirements(filePath);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('GIVEN/WHEN/THEN') || w.includes('User Stories'))).toBe(true);
    });
  });

  describe('validateDesign', () => {
    it('should fail if file still has template placeholder', () => {
      const filePath = path.join(tmpDir, 'design.md');
      fs.writeFileSync(filePath, '# Design\n\n> [Please replace this block with your generated design]\n');
      const result = validateDesign(filePath);
      expect(result.isValid).toBe(false);
    });

    it('should pass with architecture content', () => {
      const filePath = path.join(tmpDir, 'design.md');
      fs.writeFileSync(filePath, '# Design: login\n\n## Architecture\n\nThe login module uses a service-based architecture with the following components:\n- AuthService: handles authentication logic\n- UserRepository: manages user data access\n- LoginController: handles HTTP endpoints\n');
      const result = validateDesign(filePath);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTasks', () => {
    it('should fail if file still has template placeholder', () => {
      const filePath = path.join(tmpDir, 'tasks.md');
      fs.writeFileSync(filePath, '# Tasks\n\n> [Please replace this block with your generated task list]\n');
      const result = validateTasks(filePath);
      expect(result.isValid).toBe(false);
    });

    it('should pass with checklist content', () => {
      const filePath = path.join(tmpDir, 'tasks.md');
      fs.writeFileSync(filePath, '# Tasks: login\n\n- [ ] Create login form component\n- [ ] Implement AuthService\n- [ ] Add API endpoint for login\n- [ ] Write unit tests\n');
      const result = validateTasks(filePath);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should give tip if too few tasks', () => {
      const filePath = path.join(tmpDir, 'tasks.md');
      fs.writeFileSync(filePath, '# Tasks: login\n\nHere is the task list for the login feature implementation:\n\n- [ ] Implement login\n');
      const result = validateTasks(filePath);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Only 1 task'))).toBe(true);
    });
  });
});
