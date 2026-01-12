import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { CreateClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService extends ConsoleLogger {
  private supabase: SupabaseClient | null = null;
  private readonly serviceName = 'api';

  constructor(private configService: ConfigService) {
    super();
    this.initSupabase();
  }

  private initSupabase() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get<string>('SUPABASE_KEY');

    if (supabaseUrl && supabaseKey) {
      // Use direct import if needed, but since we have @supabase/supabase-js installed
      // CreateClient is usually a named export or default. Let's try standard way.
      const { createClient } = require('@supabase/supabase-js');
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      super.warn('Supabase URL or Key not found. Logs will not be saved to DB.', 'LoggingService');
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.saveLog('log', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.saveLog('error', message, context, { stack });
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.saveLog('warn', message, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.saveLog('debug', message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.saveLog('verbose', message, context);
  }

  private async saveLog(level: string, message: any, context?: string, extraMeta: any = {}) {
    if (!this.supabase) return;

    try {
      const meta = {
        context,
        ...extraMeta,
        timestamp: new Date().toISOString(),
      };

      // Since message can be object
      const msgString = typeof message === 'string' ? message : JSON.stringify(message);

      // Fire and forget to avoid blocking
      await this.supabase.from('system_logs').insert({
        level,
        service: this.serviceName,
        message: msgString,
        meta,
      });
    } catch (err) {
      // Avoid infinite loop if logging fails
      console.error('Failed to save log to Supabase:', err);
    }
  }
}
