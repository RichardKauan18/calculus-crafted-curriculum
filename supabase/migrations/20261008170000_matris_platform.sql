-- Matris platform: secure Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'student' check (role in ('student','teacher')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke update on public.profiles from authenticated;
grant update(name) on public.profiles to authenticated;

create or replace function public.is_teacher()
returns boolean language sql security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and role='teacher') $$;
revoke execute on function public.is_teacher() from public, anon;
grant execute on function public.is_teacher() to authenticated;

create or replace function public.set_user_role(p_user_id uuid,p_role text)
returns void language plpgsql security definer set search_path = public
as $$ begin
  if not public.is_teacher() then raise exception 'Not authorized'; end if;
  if p_role not in ('student','teacher') then raise exception 'Invalid role'; end if;
  update public.profiles set role=p_role where id=p_user_id;
end $$;
revoke execute on function public.set_user_role(uuid,text) from public, anon;
grant execute on function public.set_user_role(uuid,text) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id,name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'name',''),'student')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.concursos (
  id text primary key, name text not null, full_name text not null default '',
  category text not null default '', subjects jsonb not null default '[]'::jsonb,
  description text not null default '', created_at timestamptz not null default now()
);
alter table public.concursos enable row level security;
drop policy if exists concursos_select_public on public.concursos;
create policy concursos_select_public on public.concursos for select to anon, authenticated using (true);
drop policy if exists concursos_insert_teacher on public.concursos;
create policy concursos_insert_teacher on public.concursos for insert to authenticated with check (public.is_teacher());
drop policy if exists concursos_update_teacher on public.concursos;
create policy concursos_update_teacher on public.concursos for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists concursos_delete_teacher on public.concursos;
create policy concursos_delete_teacher on public.concursos for delete to authenticated using (public.is_teacher());

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(), title text not null, subject text not null,
  duration text not null default '', video_id text not null, level text not null,
  concurso_id text references public.concursos(id) on delete set null, description text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.lessons enable row level security;
drop policy if exists lessons_select_public on public.lessons;
create policy lessons_select_public on public.lessons for select to anon, authenticated using (true);
drop policy if exists lessons_insert_teacher on public.lessons;
create policy lessons_insert_teacher on public.lessons for insert to authenticated with check (public.is_teacher());
drop policy if exists lessons_update_teacher on public.lessons;
create policy lessons_update_teacher on public.lessons for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists lessons_delete_teacher on public.lessons;
create policy lessons_delete_teacher on public.lessons for delete to authenticated using (public.is_teacher());

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), name text not null, level text not null default '',
  text text not null, created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists testimonials_select_public on public.testimonials;
create policy testimonials_select_public on public.testimonials for select to anon, authenticated using (true);
drop policy if exists testimonials_insert_teacher on public.testimonials;
create policy testimonials_insert_teacher on public.testimonials for insert to authenticated with check (public.is_teacher());
drop policy if exists testimonials_update_teacher on public.testimonials;
create policy testimonials_update_teacher on public.testimonials for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists testimonials_delete_teacher on public.testimonials;
create policy testimonials_delete_teacher on public.testimonials for delete to authenticated using (public.is_teacher());

create table if not exists public.about (
  id int primary key default 1 check (id=1), name text not null default '', bio text not null default '',
  photo_url text not null default '', whatsapp text not null default '', instagram text not null default '',
  email text not null default '', updated_at timestamptz not null default now()
);
alter table public.about enable row level security;
drop policy if exists about_select_public on public.about;
create policy about_select_public on public.about for select to anon, authenticated using (true);
drop policy if exists about_insert_teacher on public.about;
create policy about_insert_teacher on public.about for insert to authenticated with check (public.is_teacher());
drop policy if exists about_update_teacher on public.about;
create policy about_update_teacher on public.about for update to authenticated using (public.is_teacher()) with check (public.is_teacher());

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5), created_at timestamptz not null default now(),
  unique(lesson_id,user_id)
);
alter table public.ratings enable row level security;
create index if not exists idx_ratings_lesson on public.ratings(lesson_id);
drop policy if exists ratings_select_public on public.ratings;
create policy ratings_select_public on public.ratings for select to anon, authenticated using (true);
drop policy if exists ratings_insert_own on public.ratings;
create policy ratings_insert_own on public.ratings for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists ratings_update_own on public.ratings;
create policy ratings_update_own on public.ratings for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists ratings_delete_own on public.ratings;
create policy ratings_delete_own on public.ratings for delete to authenticated using ((select auth.uid())=user_id);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'watching' check (status in ('watching','half','completed')),
  updated_at timestamptz not null default now(), unique(lesson_id,user_id)
);
alter table public.lesson_progress enable row level security;
create index if not exists idx_progress_user on public.lesson_progress(user_id);
create index if not exists idx_progress_lesson on public.lesson_progress(lesson_id);
drop policy if exists progress_select_own on public.lesson_progress;
create policy progress_select_own on public.lesson_progress for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists progress_insert_own on public.lesson_progress;
create policy progress_insert_own on public.lesson_progress for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists progress_update_own on public.lesson_progress;
create policy progress_update_own on public.lesson_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists progress_delete_own on public.lesson_progress;
create policy progress_delete_own on public.lesson_progress for delete to authenticated using ((select auth.uid())=user_id);

create table if not exists public.study_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lessons_per_week int not null default 3 check (lessons_per_week between 1 and 50),
  updated_at timestamptz not null default now(), unique(user_id)
);
alter table public.study_goals enable row level security;
drop policy if exists goals_select_own on public.study_goals;
create policy goals_select_own on public.study_goals for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists goals_insert_own on public.study_goals;
create policy goals_insert_own on public.study_goals for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists goals_update_own on public.study_goals;
create policy goals_update_own on public.study_goals for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists goals_delete_own on public.study_goals;
create policy goals_delete_own on public.study_goals for delete to authenticated using ((select auth.uid())=user_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_name text not null default '', text text not null, reply text, replied_by uuid references auth.users(id) on delete set null,
  replied_at timestamptz, created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create index if not exists idx_comments_lesson_created on public.comments(lesson_id,created_at desc);
drop policy if exists comments_select_public on public.comments;
create policy comments_select_public on public.comments for select to anon, authenticated using (true);
drop policy if exists comments_delete_teacher on public.comments;
create policy comments_delete_teacher on public.comments for delete to authenticated using (public.is_teacher());
drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own on public.comments for insert to authenticated with check ((select auth.uid())=user_id);
revoke update on public.comments from authenticated;
revoke insert on public.comments from authenticated;
grant insert(lesson_id,user_name,text) on public.comments to authenticated;

create or replace function public.reply_to_comment(p_comment_id uuid,p_reply text)
returns void language plpgsql security definer set search_path=public
as $$ begin
  if not public.is_teacher() then raise exception 'Not authorized'; end if;
  if p_reply is null or trim(p_reply)='' then raise exception 'Reply cannot be empty'; end if;
  update public.comments set reply=p_reply,replied_by=auth.uid(),replied_at=now() where id=p_comment_id;
end $$;
revoke execute on function public.reply_to_comment(uuid,text) from public,anon;
grant execute on function public.reply_to_comment(uuid,text) to authenticated;

create index if not exists idx_lessons_level on public.lessons(level);
create index if not exists idx_lessons_concurso_id on public.lessons(concurso_id);
