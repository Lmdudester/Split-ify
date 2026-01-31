/**
 * Rate-Limited Queue with Token Bucket Algorithm
 *
 * Manages concurrent requests with configurable rate limiting to prevent API throttling.
 * Uses token bucket algorithm for smooth, consistent rate control.
 */

export interface RateLimitedQueueConfig {
  requestsPerSecond: number;
  maxConcurrent: number;
  minDelayMs?: number;
}

export interface QueuedRequest<T> {
  key: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

export interface QueueProgress {
  completed: number;
  total: number;
  inFlight: number;
}

export class RateLimitedQueue<T = unknown> {
  private config: Required<RateLimitedQueueConfig>;
  private queue: QueuedRequest<T>[] = [];
  private inFlight = 0;
  private completed = 0;
  private tokens: number;
  private lastRefill: number;
  private processInterval: ReturnType<typeof setInterval> | null = null;
  private dedupKeys = new Set<string>();
  private onProgressCallback?: (progress: QueueProgress) => void;

  constructor(config: RateLimitedQueueConfig) {
    this.config = {
      ...config,
      minDelayMs: config.minDelayMs ?? Math.floor(1000 / config.requestsPerSecond),
    };

    // Initialize token bucket with 1 token to prevent initial burst
    this.tokens = 1;
    this.lastRefill = Date.now();
  }

  /**
   * Enqueue a request with deduplication
   * Returns a promise that resolves when the request completes
   */
  enqueue(key: string, execute: () => Promise<T>): Promise<T> {
    // Deduplicate requests by key
    if (this.dedupKeys.has(key)) {
      return Promise.resolve(null as T);
    }

    this.dedupKeys.add(key);

    return new Promise((resolve, reject) => {
      this.queue.push({
        key,
        execute,
        resolve,
        reject,
      });

      this.start();
    });
  }

  /**
   * Set progress callback to track queue status
   */
  onProgress(callback: (progress: QueueProgress) => void): void {
    this.onProgressCallback = callback;
    this.emitProgress();
  }

  /**
   * Start processing the queue
   */
  private start(): void {
    if (this.processInterval) {
      return; // Already running
    }

    // Process queue at regular intervals
    this.processInterval = setInterval(() => {
      this.refillTokens();
      this.processNext();
    }, this.config.minDelayMs);

    // Immediate first process
    this.processNext();
  }

  /**
   * Stop processing the queue
   */
  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  /**
   * Refill tokens using token bucket algorithm
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const secondsElapsed = elapsed / 1000;

    // Add tokens based on time elapsed
    const tokensToAdd = Math.floor(secondsElapsed * this.config.requestsPerSecond);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(
        this.tokens + tokensToAdd,
        this.config.requestsPerSecond
      );
      this.lastRefill = now;
    }
  }

  /**
   * Process next requests in the queue
   */
  private async processNext(): Promise<void> {
    // Process as many requests as we can within concurrency and rate limits
    while (
      this.queue.length > 0 &&
      this.inFlight < this.config.maxConcurrent &&
      this.tokens >= 1
    ) {
      const request = this.queue.shift();
      if (!request) break;

      // Consume a token
      this.tokens -= 1;
      this.inFlight += 1;

      this.emitProgress();

      // Execute request
      request
        .execute()
        .then((result) => {
          request.resolve(result);
          this.completed += 1;
        })
        .catch((error) => {
          request.reject(error);
          this.completed += 1;
        })
        .finally(() => {
          this.inFlight -= 1;
          this.emitProgress();

          // Stop processing if queue is empty
          if (this.queue.length === 0 && this.inFlight === 0) {
            this.stop();
          }
        });
    }
  }

  /**
   * Emit progress update
   */
  private emitProgress(): void {
    if (this.onProgressCallback) {
      this.onProgressCallback({
        completed: this.completed,
        total: this.completed + this.inFlight + this.queue.length,
        inFlight: this.inFlight,
      });
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): QueueProgress {
    return {
      completed: this.completed,
      total: this.completed + this.inFlight + this.queue.length,
      inFlight: this.inFlight,
    };
  }

  /**
   * Wait for all requests to complete
   */
  async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.queue.length === 0 && this.inFlight === 0) {
          clearInterval(checkInterval);
          this.stop();
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Clear the queue and reset state
   */
  clear(): void {
    this.queue = [];
    this.dedupKeys.clear();
    this.completed = 0;
    this.inFlight = 0;
    this.stop();
  }
}
