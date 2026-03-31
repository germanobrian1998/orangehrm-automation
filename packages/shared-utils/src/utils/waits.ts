/**
 * @qa-framework/shared-utils - Wait & Retry Utilities
 * Polling helpers, retry with backoff, and timeout wrappers for test automation.
 */

export interface WaitOptions {
  /** Total time to wait in milliseconds. Default: 10000 */
  timeout?: number;
  /** How long to wait between polls in milliseconds. Default: 500 */
  interval?: number;
  /** Error message to throw on timeout. */
  message?: string;
}

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Initial delay between attempts in milliseconds. Default: 1000 */
  delay?: number;
  /** If true, use exponential backoff instead of a fixed delay. Default: false */
  exponentialBackoff?: boolean;
  /** Maximum delay cap when using exponential backoff in milliseconds. Default: 30000 */
  maxDelay?: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Poll a condition function until it returns `true` or the timeout expires.
 *
 * @param condition - async (or sync) predicate that returns true when done
 * @param options   - WaitOptions
 * @throws Error if the condition is not met before the timeout
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: WaitOptions = {},
): Promise<void> {
  const { timeout = 10000, interval = 500, message } = options;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const met = await condition();
    if (met) return;
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(interval, remaining));
  }

  throw new Error(message ?? `Condition not met within ${timeout}ms`);
}

/**
 * Retry an async operation up to `maxAttempts` times.
 * Supports both fixed delay and exponential backoff.
 *
 * @param operation - async function to retry
 * @param options   - RetryOptions
 * @returns the resolved value of the first successful attempt
 * @throws the last error if all attempts fail
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = false,
    maxDelay = 30000,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const waitTime = exponentialBackoff
          ? Math.min(delay * Math.pow(2, attempt - 1), maxDelay)
          : delay;
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}

/**
 * Retry with exponential backoff (convenience wrapper around `retry`).
 *
 * @param operation   - async function to retry
 * @param maxAttempts - maximum number of attempts. Default: 3
 * @param initialDelay - initial delay in milliseconds. Default: 1000
 * @param maxDelay    - maximum delay cap in milliseconds. Default: 30000
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 30000,
): Promise<T> {
  return retry(operation, {
    maxAttempts,
    delay: initialDelay,
    exponentialBackoff: true,
    maxDelay,
  });
}

/**
 * Wrap an async operation with a hard timeout.
 * Throws if the operation does not complete in time.
 *
 * @param operation  - async operation to run
 * @param timeoutMs  - maximum allowed duration in milliseconds
 * @param message    - optional custom error message
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  message?: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(message ?? `Operation timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    const result = await Promise.race([operation(), timeoutPromise]);
    return result;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
