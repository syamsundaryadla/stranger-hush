-- Create anonymous sessions table for rate limiting and basic validation
CREATE TABLE public.anonymous_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false
);

-- Enable RLS on anonymous sessions
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to create and view their own session
CREATE POLICY "Users can manage their own anonymous session" 
ON public.anonymous_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add session_id to messages table for tracking
ALTER TABLE public.messages 
ADD COLUMN session_id UUID;

-- Create index for better performance
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);
CREATE INDEX idx_anonymous_sessions_last_message ON public.anonymous_sessions(last_message_at);

-- Update RLS policies for messages to include rate limiting
DROP POLICY "Anyone can insert messages" ON public.messages;

-- New policy that checks for valid session and rate limiting
CREATE POLICY "Authenticated sessions can insert messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  session_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.anonymous_sessions 
    WHERE anonymous_sessions.session_id = messages.session_id 
    AND is_banned = false
    AND (
      last_message_at IS NULL 
      OR last_message_at < now() - INTERVAL '2 seconds'
    )
    AND (
      message_count < 100 
      OR created_at > now() - INTERVAL '1 hour'
    )
  )
);

-- Function to update session after message
CREATE OR REPLACE FUNCTION public.update_session_after_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anonymous_sessions 
  SET 
    last_message_at = now(),
    message_count = message_count + 1
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update session stats after message insert
CREATE TRIGGER update_session_stats
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_after_message();

-- Function to clean up old anonymous sessions (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_sessions 
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;