-- Fix function search path security warnings
ALTER FUNCTION public.update_session_after_message() SET search_path = '';
ALTER FUNCTION public.cleanup_old_sessions() SET search_path = '';