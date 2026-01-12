/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Định nghĩa các loại log category
export type LogCategory =
  | 'user_action' // Thao tác người dùng: login, logout, create, update, delete
  | 'system' // Log hệ thống: startup, shutdown, config changes
  | 'http' // HTTP request/response logs
  | 'security' // Security events: auth failures, suspicious activity
  | 'performance' // Performance metrics: slow queries, high memory
  | 'error' // Error logs with stack traces
  | 'audit'; // Audit trail for compliance

// Định nghĩa các loại action
export type LogAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'view'
  | 'request'
  | 'response'
  | 'exception'
  | 'startup'
  | 'shutdown'
  | 'config_change'
  | 'auth_success'
  | 'auth_failure'
  | 'permission_denied'
  | 'rate_limit'
  | 'custom';

// Interface cho log metadata chi tiết
export interface LogMeta {
  // HTTP info
  httpMethod?: string;
  httpPath?: string;
  httpStatus?: number;
  durationMs?: number;

  // Client info
  ipAddress?: string;
  userAgent?: string;

  // Tracing
  requestId?: string;
  sessionId?: string;

  // Error info
  errorCode?: string;
  errorStack?: string;

  // User context
  userId?: string;

  // Category & Action
  category?: LogCategory;
  action?: LogAction;

  // Custom data
  [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService extends ConsoleLogger {
  private supabase: SupabaseClient | null = null;
  private readonly serviceName = 'api';
  private readonly environment: string;

  constructor(private configService: ConfigService) {
    super();
    this.environment =
      this.configService.get<string>('NODE_ENV') || 'development';
    this.initSupabase();
  }

  private initSupabase() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY');

    if (supabaseUrl && supabaseKey) {
      const { createClient } = require('@supabase/supabase-js');
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      super.warn(
        'Supabase URL or Key not found. Logs will not be saved to DB.',
        'LoggingService',
      );
    }
  }

  // === BASIC LOGGING METHODS ===

  log(message: any, context?: string) {
    super.log(message, context);
    this.saveLog('log', message, { category: 'system' }, context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.saveLog(
      'error',
      message,
      { category: 'error', errorStack: stack },
      context,
    );
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.saveLog('warn', message, { category: 'system' }, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.saveLog('debug', message, { category: 'system' }, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.saveLog('verbose', message, { category: 'system' }, context);
  }

  // === ENHANCED LOGGING METHODS ===

  /**
   * Log thao tác người dùng (login, register, CRUD, etc.)
   */
  logUserAction(action: LogAction, message: string, meta: LogMeta = {}) {
    super.log(`[USER_ACTION:${action}] ${message}`, meta.requestId);
    this.saveLog('info', message, {
      ...meta,
      category: 'user_action',
      action,
    });
  }

  /**
   * Log HTTP request/response
   */
  logHttp(
    action: 'request' | 'response',
    message: string | object,
    meta: LogMeta = {},
  ) {
    const msgStr = typeof message === 'object' ? JSON.stringify(message) : message;
    super.log(`[HTTP:${action.toUpperCase()}] ${msgStr}`, meta.requestId);
    this.saveLog('info', msgStr, {
      ...meta,
      category: 'http',
      action,
    });
  }

  /**
   * Log security events (auth failures, suspicious activity)
   */
  logSecurity(
    action: 'auth_success' | 'auth_failure' | 'permission_denied' | 'rate_limit',
    message: string,
    meta: LogMeta = {},
  ) {
    const level = action === 'auth_success' ? 'info' : 'warn';
    super[level === 'info' ? 'log' : 'warn'](
      `[SECURITY:${action}] ${message}`,
      meta.requestId,
    );
    this.saveLog(level, message, {
      ...meta,
      category: 'security',
      action,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(message: string, durationMs: number, meta: LogMeta = {}) {
    const level = durationMs > 3000 ? 'warn' : 'info';
    super[level === 'warn' ? 'warn' : 'log'](
      `[PERF] ${message} - ${durationMs}ms`,
      meta.requestId,
    );
    this.saveLog(level, message, {
      ...meta,
      category: 'performance',
      durationMs,
    });
  }

  /**
   * Log errors với full stack trace
   */
  logException(
    error: Error | unknown,
    meta: LogMeta = {},
  ) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;

    super.error(`[EXCEPTION] ${errMessage}`, errStack, meta.requestId);
    this.saveLog('error', errMessage, {
      ...meta,
      category: 'error',
      action: 'exception',
      errorStack: errStack,
    });
  }

  /**
   * Log audit trail for compliance
   */
  logAudit(action: LogAction, message: string, meta: LogMeta = {}) {
    super.log(`[AUDIT:${action}] ${message}`, meta.requestId);
    this.saveLog('info', message, {
      ...meta,
      category: 'audit',
      action,
    });
  }

  // === PRIVATE HELPER ===

  /**
   * Generate unique request ID for tracing
   */
  generateRequestId(): string {
    return randomUUID();
  }

  private async saveLog(
    level: string,
    message: any,
    meta: LogMeta = {},
    context?: string,
  ) {
    if (!this.supabase) return;

    try {
      const msgString =
        typeof message === 'string' ? message : JSON.stringify(message);

      const logEntry = {
        level,
        service: this.serviceName,
        message: msgString,
        meta: {
          context,
          timestamp: new Date().toISOString(),
          ...meta,
        },
        // Enhanced fields
        category: meta.category || 'system',
        action: meta.action || null,
        ip_address: meta.ipAddress || null,
        user_agent: meta.userAgent || null,
        request_id: meta.requestId || null,
        http_method: meta.httpMethod || null,
        http_path: meta.httpPath || null,
        http_status: meta.httpStatus || null,
        duration_ms: meta.durationMs || null,
        error_code: meta.errorCode || null,
        error_stack: meta.errorStack || null,
        session_id: meta.sessionId || null,
        user_id: meta.userId || null,
        environment: this.environment,
      };

      await this.supabase.from('system_logs').insert(logEntry);
    } catch (err) {
      console.error('Failed to save log to Supabase:', err);
    }
  }
}
