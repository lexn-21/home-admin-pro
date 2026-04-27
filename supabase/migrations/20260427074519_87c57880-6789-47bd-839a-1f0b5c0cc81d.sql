-- Lock down internal helper - only used by other SECURITY DEFINER funcs
REVOKE EXECUTE ON FUNCTION public.advisor_owner_for_token(TEXT) FROM PUBLIC, anon, authenticated;

-- The two public RPCs remain callable: the unguessable token IS the auth.
-- This is the documented pattern for share-link / magic-link style access.
COMMENT ON FUNCTION public.advisor_get_data(TEXT) IS 'Public by design: token (256 bits entropy) acts as bearer credential. Returns NULL for invalid/expired/revoked tokens.';
COMMENT ON FUNCTION public.advisor_touch_token(TEXT) IS 'Public by design: token-gated access logging.';