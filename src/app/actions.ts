

import {
  LoginInitiateResponse,
  LoginPasswordResponse,
  Submit2FAResponse,
  Switch2FAResponse,
  Session,
} from "../lib/types";

const getApiBaseUrl = () => process.env.API_BASE_URL || "http://localhost:8000/api";
const getApiKey = () => process.env.API_KEY || "";

/**
 * Timeout for API requests. The login/initiate endpoint triggers browser
 * automation that can take 30-40s+ on slow proxies, so we use a generous
 * 90-second window to avoid premature aborts.
 */
const REQUEST_TIMEOUT_MS = 90_000;

/** Maximum number of retry attempts for transient network failures. */
const MAX_RETRIES = 3;

/** Base delay between retries (doubled on each attempt). */
const RETRY_BASE_DELAY_MS = 500;

/**
 * Returns true for errors that are transient network-level failures
 * (connection reset, DNS hiccup, fetch abort) — NOT HTTP error responses.
 */
function isTransientNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("fetch failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("socket hang up") ||
    msg.includes("aborted") ||
    error.name === "AbortError"
  );
}

async function request(path: string, options?: RequestInit) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
          ...options?.headers,
        },
      });

      // Got an HTTP response — not a network error. Parse and return/throw.
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "An error occurred");
      }

      return data;
    } catch (error: unknown) {
      lastError = error;

      // Only retry on transient *network* failures, not on HTTP error responses
      // (e.g. 401, 404, 503 — those already threw above with a parsed message).
      if (attempt < MAX_RETRIES && isTransientNetworkError(error)) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[actions] fetch ${path} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms…`,
          error instanceof Error ? error.message : error,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Non-retryable or out of retries — rethrow with a friendlier message
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out — the server took too long to respond. Please try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Should never reach here, but TypeScript needs the safety net
  throw lastError;
}

export async function initiateLogin(data: { email: string; fingerprint: string }) {
  try {
    const result = await request("/google/login/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { success: true, data: result as LoginInitiateResponse };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submitPassword(data: { sessionId: string; password: string }) {
  try {
    const result = await request("/google/login/password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { success: true, data: result as LoginPasswordResponse };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submit2FA(data: { sessionId: string; code: string; challengeType?: string }) {
  try {
    const result = await request("/google/2fa", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { success: true, data: result as Submit2FAResponse };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function switch2FA(data: { sessionId: string; method: string }) {
  try {
    const result = await request("/google/2fa/switch", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { success: true, data: result as Switch2FAResponse };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getSession(sessionId: string) {
  try {
    const result = await request(`/sessions/${sessionId}`);
    return { success: true, data: result as Session };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
