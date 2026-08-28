REVOKE EXECUTE ON FUNCTION public.get_discogs_cron_secret() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.get_discogs_cron_secret() TO service_role;

REVOKE EXECUTE ON FUNCTION public.apply_bucket_storage_policies(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.apply_bucket_storage_policies(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.remove_bucket_storage_policies(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.remove_bucket_storage_policies(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.increment_airtable_usage(integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.increment_airtable_usage(integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, service_role;