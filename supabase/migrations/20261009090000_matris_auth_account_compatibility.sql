-- Align the live Matris database with the frontend's current data contract.
-- Additive only: keep legacy columns so existing data is not discarded.

alter table public.lessons
  add column if not exists duration text not null default '',
  add column if not exists video_id text not null default '';

alter table public.lessons
  alter column teacher_id set default auth.uid();

update public.lessons
set duration = duration_minutes::text || ' min'
where duration = '' and duration_minutes is not null;

alter table public.concursos
  add column if not exists name text not null default '',
  add column if not exists full_name text not null default '',
  add column if not exists category text not null default '',
  add column if not exists subjects jsonb not null default '[]'::jsonb;

update public.concursos
set name = title
where name = '' and title is not null;

update public.concursos
set full_name = title
where full_name = '' and title is not null;

alter table public.ratings
  alter column user_id set default auth.uid();

alter table public.lesson_progress
  alter column user_id set default auth.uid();

alter table public.study_goals
  alter column user_id set default auth.uid();

alter table public.comments
  add column if not exists user_name text not null default '',
  add column if not exists text text not null default '',
  add column if not exists reply text,
  add column if not exists replied_by uuid references auth.users(id) on delete set null,
  add column if not exists replied_at timestamptz;

alter table public.comments
  alter column user_id set default auth.uid();

update public.comments
set text = content
where text = '' and content is not null;

drop function if exists public.reply_to_comment(uuid, text);

create function public.reply_to_comment(p_comment_id uuid, p_reply text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'Only teachers can reply';
  end if;

  if p_reply is null or trim(p_reply) = '' then
    raise exception 'Reply cannot be empty';
  end if;

  update public.comments
  set reply = trim(p_reply),
      replied_by = auth.uid(),
      replied_at = now()
  where id = p_comment_id;

  if not found then
    raise exception 'Comment not found';
  end if;
end;
$$;

revoke execute on function public.reply_to_comment(uuid, text) from public, anon;
grant execute on function public.reply_to_comment(uuid, text) to authenticated;
