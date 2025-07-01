
-- Add priority column to ideas table
ALTER TABLE public.ideas 
ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add an index for better performance when filtering by priority
CREATE INDEX idx_ideas_priority ON public.ideas(priority);

-- Update existing records to have a default priority
UPDATE public.ideas SET priority = 'medium' WHERE priority IS NULL;
