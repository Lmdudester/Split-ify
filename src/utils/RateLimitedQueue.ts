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
  averageTimeMs?: number;
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

  // Request timing tracking (rolling window of last 100)
  private requestTimings: number[] = [];
  private readonly MAX_TIMING_SAMPLES = 100;

  // 5-minute sliding window for rate limit compliance
  private requestTimestamps: number[] = [];
  private readonly SLIDING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  // Completion timestamps for throughput calculation (includes rate limit delays)
  private completionTimestamps: number[] = [];
  private readonly MAX_COMPLETION_SAMPLES = 100;

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
   * Clean old timestamps outside the 5-minute window
   */
  private cleanOldTimestamps(): void {
    const now = Date.now();
    const cutoff = now - this.SLIDING_WINDOW_MS;

    // Remove timestamps older than 5 minutes
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > cutoff
    );
  }

  /**
   * Check if we can make a request without exceeding 5-minute average rate
   * Returns true if we're within the allowed rate
   */
  private canMakeRequestWithinWindow(): boolean {
    this.cleanOldTimestamps();

    const now = Date.now();
    const windowStart = now - this.SLIDING_WINDOW_MS;

    // Count requests in the last 5 minutes
    const requestsInWindow = this.requestTimestamps.length;

    // Calculate elapsed time in seconds since first request in window
    const oldestTimestamp = this.requestTimestamps[0] || now;
    const elapsedSeconds = Math.max((now - Math.max(oldestTimestamp, windowStart)) / 1000, 1);

    // Calculate current average rate
    const currentRate = requestsInWindow / elapsedSeconds;

    // Allow request if current rate is below our configured limit
    // Use 90% of configured rate as safety margin
    return currentRate < (this.config.requestsPerSecond * 0.9);
  }

  /**
   * Record a request timestamp for sliding window tracking
   */
  private recordRequestTimestamp(): void {
    this.requestTimestamps.push(Date.now());
    this.cleanOldTimestamps();
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
      this.tokens >= 1 &&
      this.canMakeRequestWithinWindow() // Check 5-minute sliding window
    ) {
      const request = this.queue.shift();
      if (!request) break;

      // Consume a token
      this.tokens -= 1;
      this.inFlight += 1;

      // Record timestamp for sliding window tracking
      this.recordRequestTimestamp();

      this.emitProgress();

      // Track request start time
      const startTime = Date.now();

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
          // Record request duration (HTTP request time only)
          const duration = Date.now() - startTime;
          this.recordRequestTime(duration);

          // Record completion timestamp (for throughput calculation including delays)
          this.recordCompletionTimestamp();

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
   * Record request completion time (actual HTTP request duration)
   */
  private recordRequestTime(durationMs: number): void {
    this.requestTimings.push(durationMs);

    // Keep only last MAX_TIMING_SAMPLES
    if (this.requestTimings.length > this.MAX_TIMING_SAMPLES) {
      this.requestTimings.shift();
    }
  }

  /**
   * Record completion timestamp for throughput calculation
   */
  private recordCompletionTimestamp(): void {
    this.completionTimestamps.push(Date.now());

    // Keep only last MAX_COMPLETION_SAMPLES
    if (this.completionTimestamps.length > this.MAX_COMPLETION_SAMPLES) {
      this.completionTimestamps.shift();
    }
  }

  /**
   * Calculate throughput-based average time per item (includes rate limit delays)
   * This is the actual wall-clock time between completions
   */
  private getThroughputBasedAverageTime(): number | null {
    if (this.completionTimestamps.length < 2) {
      return null;
    }

    // Calculate time span from first to last completion
    const firstTimestamp = this.completionTimestamps[0];
    const lastTimestamp = this.completionTimestamps[this.completionTimestamps.length - 1];
    const timeSpanMs = lastTimestamp - firstTimestamp;

    // Calculate average time per completion (items - 1 because we're measuring intervals)
    const numIntervals = this.completionTimestamps.length - 1;
    const averageTimePerItem = timeSpanMs / numIntervals;

    return averageTimePerItem;
  }

  /**
   * Get average request time including rate limit delays
   * Uses throughput calculation for realistic ETA estimates
   */
  getAverageRequestTime(): number | null {
    // Use throughput-based calculation which includes all delays
    return this.getThroughputBasedAverageTime();
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
        averageTimeMs: this.getAverageRequestTime() ?? undefined,
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
      averageTimeMs: this.getAverageRequestTime() ?? undefined,
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
    this.requestTimings = [];
    this.requestTimestamps = [];
    this.completionTimestamps = [];
    this.stop();
  }
}
