import { describe, it, expect } from 'vitest';

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return trimmedUrl;

  const withoutTrailingSlash = trimmedUrl.replace(/\/$/, '');

  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

function getApiBaseUrl(hostname) {
  const fallbackApiUrl = (() => {
    const host = hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    if (host.includes('github.io')) {
      return 'https://leavedesk-api.onrender.com/api';
    }

    return `http://${host}:5000/api`;
  })();

  return normalizeApiBaseUrl(import.meta.env.VITE_API_URL || fallbackApiUrl);
}

describe('API base URL selection', () => {
  it('uses the Render backend for GitHub Pages deployments', () => {
    expect(getApiBaseUrl('tarun7982.github.io')).toBe('https://leavedesk-api.onrender.com/api');
  });

  it('uses localhost for local development', () => {
    expect(getApiBaseUrl('localhost')).toBe('http://localhost:5000/api');
  });

  it('uses the Render backend for non-localhost deployments by default', () => {
    expect(getApiBaseUrl('example.com')).toBe('https://leavedesk-api.onrender.com/api');
  });

  it('adds /api when the configured URL omits it', () => {
    expect(normalizeApiBaseUrl('https://leavedesk-api.onrender.com')).toBe('https://leavedesk-api.onrender.com/api');
  });
});
