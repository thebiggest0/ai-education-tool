import { config } from '../config/env.js';

/**
 * Sends an HTTP request to the AI microservice.
 *
 * @param {string} path - The endpoint path (e.g., '/predict', '/generate').
 * @param {object} options - Fetch options including method and body.
 * @param {string} [options.method='POST'] - The HTTP method.
 * @param {object} [options.body] - The request body (will be JSON-serialized).
 * @returns {Promise<{status: number, data: object}>} The response status and parsed JSON body.
 */
async function request(path, options = {}) {
  const { method = 'POST', body } = options;

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${config.aiServiceUrl}${path}`, fetchOptions);
  const data = await response.json();

  return { status: response.status, data };
}

export const aiServiceClient = { request };
