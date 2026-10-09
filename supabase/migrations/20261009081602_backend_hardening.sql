-- Matris backend hardening: security-definer search paths, comment validation and FK indexes.
-- This migration is additive and preserves existing user/content rows.

create index if not exists comments_replied_by_idx on public.comments (replied_by);
create index if not exists comments_reply_to_idx on public.comments (reply_to);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists ratings_user_id_idx on public.ratings (user_id);

alter table public.comments
  add constraint comments_text_length_check
    check (char_length(btrim(text)) between 1 and 2000) not valid,
  add constraint comments_user_name_length_check
    check (char_length(btrim(user_name)) between 1 and 120) not valid;

alter table public.comments validate constraint comments_text_length_check;
alter table public.comments validate constraint comments_user_name_length_check;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'teacher'
  );
$function$;

create or replace function public.reply_to_comment(p_comment_id uuid, p_reply text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not public.is_teacher() then
    raise exception 'Only authenticated teachers can reply';
  end if;

  if p_reply is null or char_length(btrim(p_reply)) not between 1 and 2000 then
    raise exception 'Reply must contain between 1 and 2000 characters';
  end if;

  update public.comments c
  set reply = btrim(p_reply),
      replied_by = auth.uid(),
      replied_at = now()
  from public.lessons l
  where c.id = p_comment_id
    and l.id = c.lesson_id
    and l.teacher_id = auth.uid();

  if not found then
    raise exception 'Comment not found or lesson is not owned by this teacher';
  end if;
end;
$function$;

create or replace function public.set_user_role(target_user uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.is_teacher() then
    raise exception 'Only teachers can change roles';
  end if;
  if new_role not in ('student', 'teacher') then
    raise exception 'Invalid role';
  end if;
  update public.profiles
  set role = new_role, updated_at = now()
  where id = target_user;
end;
$function$;

revoke all on function public.set_user_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_user_role(uuid, text) to service_role;
