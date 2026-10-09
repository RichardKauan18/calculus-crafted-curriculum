create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Role changes are restricted to administrators';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_self_role_change on public.profiles;
create trigger prevent_self_role_change
before update of role on public.profiles
for each row execute function public.prevent_self_role_change();
