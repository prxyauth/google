

import {
  LoginInitiateResponse,
  LoginPasswordResponse,
  Submit2FAResponse,
  Switch2FAResponse,
  Session,
} from "../lib/types";

const getApiBaseUrl = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const getApiKey = () => process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data;
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

export async function submit2FA(data: { sessionId: string; code: string }) {
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
