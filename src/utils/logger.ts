/**
 * Development Logger Utility
 * 
 * Provides logging functionality that only runs in development mode.
 * In production builds, all log statements are no-ops.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  enabled?: boolean;
}

class Logger {
  private prefix: string;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '';
    this.enabled = options.enabled ?? import.meta.env.DEV;
  }

  /**
   * Log debug information (development only)
   */
  debug(...args: unknown[]): void {
    if (!this.enabled) return;
    this.log('debug', ...args);
  }

  /**
   * Log informational messages (development only)
   */
  info(...args: unknown[]): void {
    if (!this.enabled) return;
    this.log('info', ...args);
  }

  /**
   * Log warnings (development only)
   */
  warn(...args: unknown[]): void {
    if (!this.enabled) return;
    this.log('warn', ...args);
  }

  /**
   * Log errors (always logged, even in production)
   */
  error(...args: unknown[]): void {
    // Errors are always logged, even in production
    this.log('error', ...args);
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      enabled: this.enabled,
    });
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}]` : '';
    const levelStr = `[${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(timestamp, levelStr, prefixStr, ...args);
        break;
      case 'info':
        console.log(timestamp, levelStr, prefixStr, ...args);
        break;
      case 'warn':
        console.warn(timestamp, levelStr, prefixStr, ...args);
        break;
      case 'error':
        console.error(timestamp, levelStr, prefixStr, ...args);
        break;
    }
  }
}

// Export singleton instance for general use
export const logger = new Logger();

// Export class for creating custom loggers
export { Logger };

// Export convenience functions
export const createLogger = (prefix: string): Logger => {
  return new Logger({ prefix });
};
