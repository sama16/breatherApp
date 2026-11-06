/**
 * Stops duplicate TAPS while a request is in flight.
 *
 * This is a UI convenience only. It is NOT idempotency and does not replace the backend:
 * the backend's version check (409 "stale") is what makes a decision atomic and safe if two
 * devices, or a retry after a lost response, decide the same thing.
 */
export interface SubmitGuard {
  readonly inFlight: boolean;
  run<T>(fn: () => Promise<T>): Promise<{ ran: true; value: T } | { ran: false }>;
}

export function createSubmitGuard(): SubmitGuard {
  let inFlight = false;
  return {
    get inFlight() {
      return inFlight;
    },
    async run<T>(fn: () => Promise<T>) {
      if (inFlight) return { ran: false as const };
      inFlight = true;
      try {
        return { ran: true as const, value: await fn() };
      } finally {
        inFlight = false;
      }
    },
  };
}
