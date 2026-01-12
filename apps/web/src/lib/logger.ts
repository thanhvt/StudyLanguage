export type LogLevel = 'log' | 'info' | 'error' | 'warn' | 'debug' | 'verbose';

export type LogCategory =
  | 'user_action'
  | 'system'
  | 'http'
  | 'security'
  | 'performance'
  | 'error'
  | 'audit';

export type LogAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'view'
  | 'click'
  | 'navigate'
  | 'submit'
  | 'download'
  | 'upload'
  | 'search'
  | 'filter'
  | 'custom';

export interface LogMeta {
  category?: LogCategory;
  action?: LogAction;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  durationMs?: number;
  errorCode?: string;
  errorStack?: string;
  [key: string]: unknown;
}

/**
 * Logger Utility cho Next.js (Client & Server)
 * - Client: Gửi log qua /api/logs để lưu vào Supabase
 * - Server: Log trực tiếp (console) hoặc gửi về Supabase
 */
class Logger {
  private serviceName = 'web';

  // === BASIC METHODS ===

  log(message: any, meta?: LogMeta) {
    this.send('log', message, { category: 'system', ...meta });
  }

  error(message: any, meta?: LogMeta) {
    this.send('error', message, { category: 'error', ...meta });
  }

  warn(message: any, meta?: LogMeta) {
    this.send('warn', message, { category: 'system', ...meta });
  }

  debug(message: any, meta?: LogMeta) {
    this.send('debug', message, { category: 'system', ...meta });
  }

  info(message: any, meta?: LogMeta) {
    this.send('info', message, { category: 'system', ...meta });
  }

  // === ENHANCED METHODS ===

  /**
   * Log thao tác người dùng
   */
  logUserAction(action: LogAction, message: string, meta: LogMeta = {}) {
    this.send('info', message, { ...meta, category: 'user_action', action });
  }

  /**
   * Log navigation/page view
   */
  logPageView(url: string, meta: LogMeta = {}) {
    this.send('info', 'PAGE_VIEW', {
      ...meta,
      category: 'user_action',
      action: 'navigate',
      url,
    });
  }

  /**
   * Log button click
   */
  logClick(elementId: string, elementName: string, meta: LogMeta = {}) {
    this.send('info', `Clicked: ${elementName}`, {
      ...meta,
      category: 'user_action',
      action: 'click',
      elementId,
      elementName,
    });
  }

  /**
   * Log form submit
   */
  logFormSubmit(formName: string, meta: LogMeta = {}) {
    this.send('info', `Form submitted: ${formName}`, {
      ...meta,
      category: 'user_action',
      action: 'submit',
      formName,
    });
  }

  /**
   * Log search
   */
  logSearch(query: string, resultsCount?: number, meta: LogMeta = {}) {
    this.send('info', `Search: ${query}`, {
      ...meta,
      category: 'user_action',
      action: 'search',
      searchQuery: query,
      resultsCount,
    });
  }

  /**
   * Log authentication events
   */
  logAuth(
    action: 'login' | 'logout' | 'register',
    success: boolean,
    meta: LogMeta = {},
  ) {
    const level = success ? 'info' : 'warn';
    this.send(level, `Auth ${action}: ${success ? 'success' : 'failed'}`, {
      ...meta,
      category: 'security',
      action,
      success,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, durationMs: number, meta: LogMeta = {}) {
    const level = durationMs > 3000 ? 'warn' : 'info';
    this.send(level, `Performance: ${metric}`, {
      ...meta,
      category: 'performance',
      durationMs,
      metric,
    });
  }

  /**
   * Log errors with stack trace
   */
  logException(error: Error | unknown, meta: LogMeta = {}) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    this.send('error', message, {
      ...meta,
      category: 'error',
      errorStack: stack,
    });
  }

  // === PRIVATE ===

  private async send(level: LogLevel, message: any, meta: LogMeta = {}) {
    const isClient = typeof window !== 'undefined';
    const timestamp = new Date().toISOString();

    // Console output
    const consoleMethod =
      level === 'log' ? 'log' : level in console ? level : 'log';
    (console as any)[consoleMethod](
      `[${level.toUpperCase()}]`,
      message,
      meta,
    );

    if (isClient) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            service: this.serviceName,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            category: meta.category || 'system',
            action: meta.action || null,
            meta: {
              ...meta,
              url: meta.url || window.location.href,
              userAgent: navigator.userAgent,
              referrer: document.referrer || null,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height,
              language: navigator.language,
            },
            timestamp,
          }),
        });
      } catch (err) {
        console.error('Failed to send log to API:', err);
      }
    }
  }
}

export const logger = new Logger();
