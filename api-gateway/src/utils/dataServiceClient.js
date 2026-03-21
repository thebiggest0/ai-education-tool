import { config } from '../config/env.js';

/**
 * Sends an HTTP request to the data service with the internal secret header.
 *
 * @param {string} path - The endpoint path (e.g., '/internal/users/create').
 * @param {object} options - Fetch options including method, body, etc.
 * @param {string} [options.method='GET'] - The HTTP method.
 * @param {object} [options.body] - The request body (will be JSON-serialized).
 * @returns {Promise<{status: number, data: object}>} The response status and parsed JSON body.
 */
async function request(path, options = {}) {
  const { method = 'GET', body } = options;

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': config.internalSecret,
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${config.dataServiceUrl}${path}`, fetchOptions);
  const data = await response.json();

  return { status: response.status, data };
}

export const dataServiceClient = { request };
