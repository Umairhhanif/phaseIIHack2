/**
 * Better Auth configuration with JWT plugin.
 *
 * Configured per research.md with 7-day token expiry.
 */

// Placeholder for Better Auth configuration
// Note: Better Auth actual implementation may require npm install better-auth
// For now, this module provides auth helper functions

/**
 * Get auth token from storage.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || null;
}

/**
 * Set auth token in storage.
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

/**
 * Clear auth token from storage.
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

/**
 * Check if token is expired based on JWT exp claim.
 */
export function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch {
    return true; // Invalid token format
  }
}

/**
 * Get user ID from JWT token.
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || null;
  } catch {
    return null;
  }
}
