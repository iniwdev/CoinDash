/**
 * aiService.js — CoinDash AI
 *
 * Reusable async service for the AI chat endpoint.
 * Uses the shared Axios apiClient so all requests automatically get:
 *   - Bearer token injection
 *   - Silent 401 → refresh → retry cycle
 *   - Global timeout (15 s, set in apiClient)
 *
 * Abort-controller support prevents duplicate in-flight requests
 * when the component unmounts mid-request.
 */

import apiClient from '@/lib/apiClient';

// ── AbortController registry ──────────────────────────────────────────────────
// Stores the currently active controller so callers can cancel the previous
// request before firing a new one (prevents race conditions on fast typing).
let _activeController = null;

/**
 * Cancel any in-flight AI request.
 * Safe to call even if nothing is in flight.
 */
export function cancelActiveRequest() {
  if (_activeController) {
    _activeController.abort();
    _activeController = null;
  }
}

/**
 * Send a chat message to CoinDash AI.
 *
 * @param {string} message  - The user's message
 * @returns {Promise<string>} The AI's reply text
 * @throws {Error} Rethrows structured errors for the component to handle
 */
export async function sendChatMessage(message) {
  // Cancel any previous request before issuing a new one
  cancelActiveRequest();

  _activeController = new AbortController();

  try {
    const { data } = await apiClient.post(
      '/ai/chat',
      { message },
      { signal: _activeController.signal }
    );

    if (!data?.reply) {
      throw new Error('Received an empty response from the AI.');
    }

    return data.reply;

  } catch (err) {
    // AbortError is intentional — don't surface it as a user-facing error
    if (err.name === 'AbortError' || err.name === 'CanceledError') {
      return null;
    }

    // Axios wraps HTTP errors — extract the most meaningful message
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail || err.response.data?.message;

      if (status === 503 || status === 502) {
        throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
      }
      if (status === 429) {
        throw new Error("I'm handling a lot of requests right now. Please wait a moment and try again.");
      }
      if (status === 422) {
        throw new Error('Your message could not be processed. Please try rephrasing it.');
      }
      if (detail && typeof detail === 'string') {
        throw new Error(detail);
      }
    }

    // Network error (no response at all)
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error("The AI took too long to respond. Please try again.");
    }

    throw new Error(err.message || 'Something went wrong. Please try again.');

  } finally {
    _activeController = null;
  }
}
