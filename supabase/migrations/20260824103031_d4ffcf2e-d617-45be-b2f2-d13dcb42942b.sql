GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ideas_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.ideas_id_seq TO service_role;