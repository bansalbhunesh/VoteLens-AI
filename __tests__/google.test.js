import { describe, it, expect, jest } from '@jest/globals';
import { getFirebaseApp, getGoogleOAuth2Client } from '../api/services/google.js';

describe('Vertex AI and Firebase Services Integration suite', () => {
  it('should initialize and export a valid Firebase App instance', () => {
    const app = getFirebaseApp();
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should create valid Google OAuth2 Clients for Vertex AI validation', () => {
    const oauth2 = getGoogleOAuth2Client();
    expect(oauth2).toBeDefined();
  });
});
