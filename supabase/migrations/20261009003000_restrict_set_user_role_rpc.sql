-- Role changes are administrative and must not be exposed to ordinary signed-in users.
revoke execute on function public.set_user_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_user_role(uuid, text) to service_role;
