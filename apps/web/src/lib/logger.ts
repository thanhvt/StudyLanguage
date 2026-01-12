export type LogLevel = 'log' | 'info' | 'error' | 'warn' | 'debug' | 'verbose';

/**
 * Utility for logging from client and server components in Next.js.
 * - Server-side: Logs to console (and ideally directly to Supabase if passing correct client, 
 *   but for simplicity, we treat console as the primary output for server logs which host might pick up).
 * - Client-side: Sends logs to /api/logs to be stored in Supabase.
 */
class Logger {
  private serviceName = 'web';

  log(message: any, meta?: any) {
    this.send('log', message, meta);
  }

  error(message: any, meta?: any) {
    this.send('error', message, meta);
  }

  warn(message: any, meta?: any) {
    this.send('warn', message, meta);
  }

  debug(message: any, meta?: any) {
    this.send('debug', message, meta);
  }

  private async send(level: LogLevel, message: any, meta: any = {}) {
    const isClient = typeof window !== 'undefined';
    const timestamp = new Date().toISOString();

    // Console output for immediate feedback
    const consoleMethod = level === 'log' ? 'log' : level in console ? level : 'log';
    (console as any)[consoleMethod](`[${level.toUpperCase()}]`, message, meta);

    if (isClient) {
      // Send to API Route from Client
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level,
            service: this.serviceName,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            meta: { ...meta, url: window.location.href, userAgent: navigator.userAgent },
            timestamp,
          }),
        });
      } catch (err) {
        console.error('Failed to send log to API:', err);
      }
    } else {
      // Server-side logging
      // In a real production environment, you might want to instantiate Supabase client here and write directly.
      // For now, console logging on server is sufficient as many deployment platforms capture stdout.
      // Or we can fetch to the full URL of the API if needed, but that adds overhead.
    }
  }
}

export const logger = new Logger();
