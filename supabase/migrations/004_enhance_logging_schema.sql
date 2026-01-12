-- Migration: Enhance system_logs table with more details
-- This migration adds new columns and updates existing structure

-- Add new columns for enhanced logging
ALTER TABLE public.system_logs 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'system',  -- 'user_action', 'system', 'http', 'security', 'performance'
  ADD COLUMN IF NOT EXISTS action text,                      -- Specific action: 'login', 'logout', 'create', 'update', 'delete', 'view', etc.
  ADD COLUMN IF NOT EXISTS ip_address inet,                  -- IP address of the request
  ADD COLUMN IF NOT EXISTS user_agent text,                  -- Browser/client user agent
  ADD COLUMN IF NOT EXISTS request_id uuid,                  -- Unique request ID for tracing
  ADD COLUMN IF NOT EXISTS http_method text,                 -- GET, POST, PUT, DELETE, etc.
  ADD COLUMN IF NOT EXISTS http_path text,                   -- Request path
  ADD COLUMN IF NOT EXISTS http_status integer,              -- HTTP response status code
  ADD COLUMN IF NOT EXISTS duration_ms integer,              -- Request duration in milliseconds
  ADD COLUMN IF NOT EXISTS error_code text,                  -- Error code if applicable
  ADD COLUMN IF NOT EXISTS error_stack text,                 -- Stack trace for errors
  ADD COLUMN IF NOT EXISTS session_id text,                  -- Session identifier
  ADD COLUMN IF NOT EXISTS environment text DEFAULT 'development'; -- 'development', 'staging', 'production'

-- Add constraint for category
ALTER TABLE public.system_logs DROP CONSTRAINT IF EXISTS system_logs_category_check;
ALTER TABLE public.system_logs ADD CONSTRAINT system_logs_category_check 
  CHECK (category IN ('user_action', 'system', 'http', 'security', 'performance', 'error', 'audit'));

-- Update level constraint to include more levels
ALTER TABLE public.system_logs DROP CONSTRAINT IF EXISTS system_logs_level_check;
ALTER TABLE public.system_logs ADD CONSTRAINT system_logs_level_check 
  CHECK (level IN ('log', 'info', 'error', 'warn', 'debug', 'verbose', 'fatal', 'trace'));

-- Create additional indexes for better querying
CREATE INDEX IF NOT EXISTS system_logs_category_idx ON public.system_logs (category);
CREATE INDEX IF NOT EXISTS system_logs_action_idx ON public.system_logs (action);
CREATE INDEX IF NOT EXISTS system_logs_user_id_idx ON public.system_logs (user_id);
CREATE INDEX IF NOT EXISTS system_logs_request_id_idx ON public.system_logs (request_id);
CREATE INDEX IF NOT EXISTS system_logs_http_status_idx ON public.system_logs (http_status);
CREATE INDEX IF NOT EXISTS system_logs_ip_address_idx ON public.system_logs (ip_address);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS system_logs_service_level_created_idx 
  ON public.system_logs (service, level, created_at DESC);
CREATE INDEX IF NOT EXISTS system_logs_category_action_created_idx 
  ON public.system_logs (category, action, created_at DESC);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.system_logs IS 'Centralized logging table for all application events';
COMMENT ON COLUMN public.system_logs.category IS 'Log category: user_action, system, http, security, performance, error, audit';
COMMENT ON COLUMN public.system_logs.action IS 'Specific action performed: login, logout, create, update, delete, view, etc.';
COMMENT ON COLUMN public.system_logs.level IS 'Log severity: trace, debug, info, log, warn, error, fatal';
COMMENT ON COLUMN public.system_logs.request_id IS 'Unique identifier to trace a single request across logs';
