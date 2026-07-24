import { updateDocument, detectConflictingFeedback } from './updater';

describe('Document Updater', () => {
  describe('updateDocument', () => {
    it('should append new sections correctly', () => {
      const current = '# Design\n## Overview\nText';
      const result = updateDocument(current, [
        { type: 'addition', section: 'Architecture', content: 'New Arch' }
      ]);
      expect(result.newContent).toContain('## Architecture');
      expect(result.newContent).toContain('New Arch');
      expect(result.validation.isValid).toBe(true);
    });

    it('should flag errors when modifying unknown sections', () => {
      const current = '# Design';
      const result = updateDocument(current, [
        { type: 'modification', section: 'Unknown', content: 'Text' }
      ]);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toContain('Section not found: Unknown');
    });
  });

  describe('detectConflictingFeedback', () => {
    it('should detect when adding an existing section', () => {
      const current = '# Design\n## Overview\nText';
      const conflicts = detectConflictingFeedback(current, [
        { type: 'addition', section: 'Overview', content: 'Text' }
      ]);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0]).toContain('already exists');
    });

    it('should detect when deleting a non-existent section', () => {
      const current = '# Design';
      const conflicts = detectConflictingFeedback(current, [
        { type: 'deletion', section: 'Overview', content: '' }
      ]);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0]).toContain('does not exist');
    });
  });
});
