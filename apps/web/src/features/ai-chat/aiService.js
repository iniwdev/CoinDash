/**
 * aiService.js — CoinDash AI
 *
 * Reusable async service for the AI chat endpoint.
 *
 * Two modes:
 *   1. streamChatMessage()  — SSE streaming (primary, ChatGPT-style UX)
 *   2. sendChatMessage()    — Non-streaming fallback (single JSON response)
 *
 * The streaming function uses native `fetch` + `ReadableStream` to parse
 * Server-Sent Events. We can't use the Axios client for SSE because Axios
 * buffers the full response body. For auth, we manually read the access
 * token from the Zustand store (same source the Axios interceptor uses).
 *
 * Abort-controller support prevents duplicate in-flight requests
 * when the component unmounts or sends a new message.
 */

import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

// ── AbortController registry ──────────────────────────────────────────────────
let _activeController = null;

/**
 * Cancel any in-flight AI request (streaming or non-streaming).
 * Safe to call even if nothing is in flight.
 */
export function cancelActiveRequest() {
  if (_activeController) {
    _activeController.abort();
    _activeController = null;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SSE Streaming API (primary)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stream a chat message from CoinDash AI via Server-Sent Events.
 *
 * @param {string}   message   - The user's message
 * @param {function} onToken   - Called with each text chunk: onToken(tokenStr)
 * @param {function} onDone    - Called when the stream is complete
 * @param {function} onError   - Called with an error message string
 * @returns {function}         - A cancel() function to abort the stream
 */
export function streamChatMessage(message, { onToken, onDone, onError }) {
  // Cancel any previous request
  cancelActiveRequest();
  _activeController = new AbortController();
  const { signal } = _activeController;

  // Read auth token directly from the Zustand store
  const { accessToken } = useAuthStore.getState();
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Fire the streaming fetch
  fetch('/api/v1/ai/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        // Try to extract a meaningful error from the JSON body
        let detail = 'AI service returned an error.';
        try {
          const errorBody = await response.json();
          detail = errorBody?.detail || errorBody?.message || detail;
        } catch { /* body wasn't JSON */ }

        if (response.status === 429) {
          detail = "I'm handling a lot of requests right now. Please wait a moment and try again.";
        } else if (response.status === 503 || response.status === 502) {
          detail = 'AI service is temporarily unavailable. Please try again in a moment.';
        }

        onError?.(detail);
        return;
      }

      // ── Parse SSE stream ──────────────────────────────────────────────
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by double newlines
        const frames = buffer.split('\n\n');
        // Keep the last (potentially incomplete) frame in the buffer
        buffer = frames.pop() || '';

        for (const frame of frames) {
          if (!frame.trim()) continue;

          let eventType = 'message';
          let data = '';

          for (const line of frame.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              data = line.slice(6);
            }
          }

          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            switch (eventType) {
              case 'token':
                onToken?.(parsed.token || '');
                break;
              case 'done':
                onDone?.();
                break;
              case 'error':
                onError?.(parsed.message || 'Something went wrong.');
                break;
              default:
                break;
            }
          } catch {
            // Malformed JSON in SSE data — skip this frame
          }
        }
      }

      // If we exited the loop without a 'done' event, signal completion
      // (can happen if the connection closes cleanly after the last token)
      // The component's onDone handler is idempotent, so calling it twice is safe.

    })
    .catch((err) => {
      if (err.name === 'AbortError') return; // intentional cancel — not an error
      onError?.(err.message || 'Network error. Please try again.');
    })
    .finally(() => {
      _activeController = null;
    });

  // Return a cancel function for the caller
  return () => {
    _activeController?.abort();
    _activeController = null;
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Non-streaming API (fallback / legacy)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a chat message to CoinDash AI (non-streaming).
 *
 * @param {string} message  - The user's message
 * @returns {Promise<string>} The AI's reply text
 * @throws {Error} Rethrows structured errors for the component to handle
 */
export async function sendChatMessage(message) {
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
    if (err.name === 'AbortError' || err.name === 'CanceledError') {
      return null;
    }

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

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error("The AI took too long to respond. Please try again.");
    }

    throw new Error(err.message || 'Something went wrong. Please try again.');

  } finally {
    _activeController = null;
  }
}
