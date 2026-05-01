import { describe, it, expect, jest } from '@jest/globals';
import { getFirebaseApp } from '../api/services/google.js';

describe('Google and Firebase Integration', () => {
  it('should initialize and export a valid Firebase App instance', () => {
    const app = getFirebaseApp();
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });
});
