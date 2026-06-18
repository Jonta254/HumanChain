"use client";

/**
 * fetch() with an AbortController timeout.
 * WKWebView (World App) has no built-in request timeout — without this,
 * any hanging request blocks the UI indefinitely.
 */
export function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 10_000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...fetchOptions, signal: controller.signal }).finally(() =>
    window.clearTimeout(timer),
  );
}
