// src/services/syncRetryHandler.ts

type RetryConfig = {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
  };
  
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000  // 10 seconds
  };
  
  export class SyncRetryHandler {
    private static calculateDelay(attempt: number, config: RetryConfig): number {
      const delay = Math.min(
        config.maxDelay,
        config.baseDelay * Math.pow(2, attempt)
      );
      // Add some jitter to prevent thundering herd
      return delay * (0.75 + Math.random() * 0.5);
    }
  
    static async retryOperation<T>(
      operation: () => Promise<T>,
      config: Partial<RetryConfig> = {}
    ): Promise<T> {
      const finalConfig = { ...defaultConfig, ...config };
      let lastError: Error | null = null;
  
      for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;
          
          // Check if we should retry based on error type
          if (this.shouldRetry(error) && attempt < finalConfig.maxAttempts - 1) {
            const delay = this.calculateDelay(attempt, finalConfig);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }
      }
  
      throw lastError || new Error('Operation failed after all retry attempts');
    }
  
    private static shouldRetry(error: any): boolean {
      // Retry on network errors and specific Supabase errors
      if (error.code) {
        const retryableCodes = [
          '503',  // Service unavailable
          '429',  // Too many requests
          '408',  // Request timeout
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND'
        ];
        return retryableCodes.includes(error.code);
      }
      return error instanceof TypeError || // Network errors
             error.message?.includes('network') ||
             error.message?.includes('timeout');
    }
  }