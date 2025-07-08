
-- Create table for monthly expenses (Moni project integration)
CREATE TABLE public.depenses_mois (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total NUMERIC NOT NULL DEFAULT 0,
  semaine_moyenne NUMERIC NOT NULL DEFAULT 0,
  annee TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.depenses_mois ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all expenses" 
  ON public.depenses_mois 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can create expenses" 
  ON public.depenses_mois 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update expenses" 
  ON public.depenses_mois 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete expenses" 
  ON public.depenses_mois 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Add index for better performance
CREATE INDEX idx_depenses_mois_annee ON public.depenses_mois(annee);
