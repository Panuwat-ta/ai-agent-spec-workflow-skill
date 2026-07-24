import fc from 'fast-check';
import { identifyEARSPattern, validateEARSPatterns } from './ears';

describe('EARS Validator', () => {
  it('should correctly identify Ubiquitous pattern', () => {
    expect(identifyEARSPattern('The system shall display the login screen.')).toBe('ubiquitous');
    expect(identifyEARSPattern('System shall perform backup.')).toBe('ubiquitous');
  });

  it('should correctly identify Event-driven pattern', () => {
    expect(identifyEARSPattern('When the user clicks submit, the system shall process the order.')).toBe('event-driven');
  });

  it('should correctly identify State-driven pattern', () => {
    expect(identifyEARSPattern('While the system is in maintenance mode, it shall reject new connections.')).toBe('state-driven');
  });

  it('should correctly identify Unwanted-event pattern', () => {
    expect(identifyEARSPattern('If the connection fails, then the system shall retry 3 times.')).toBe('unwanted-event');
    expect(identifyEARSPattern('If an error occurs, the system shall log it.')).toBe('unwanted-event');
  });

  it('should correctly identify Optional pattern', () => {
    expect(identifyEARSPattern('Where a secondary monitor is present, the application shall extend the display.')).toBe('optional');
  });

  it('should correctly identify Complex pattern', () => {
    expect(identifyEARSPattern('While in flight, when turbulence is detected, the system shall alert the crew.')).toBe('complex');
  });

  it('should identify invalid or unknown patterns', () => {
    expect(identifyEARSPattern('The system should probably do something')).toBe('unknown');
    expect(identifyEARSPattern('Users can click the button')).toBe('unknown');
  });

  it('should validate an array of descriptions', () => {
    const valid = [
      'The system shall initialize.',
      'When triggered, the system shall act.'
    ];
    
    const invalid = [
      'It does stuff.',
      'Sometimes we want it to work.'
    ];

    expect(validateEARSPatterns(valid).isValid).toBe(true);
    
    const invalidResult = validateEARSPatterns(invalid);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveLength(2);
  });
});
