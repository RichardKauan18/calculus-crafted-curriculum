create table if not exists public.teacher_feedback (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 100),
  message text not null check (char_length(trim(message)) between 5 and 1000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teacher_feedback enable row level security;

drop policy if exists "teacher_feedback_select_student_published_or_owner" on public.teacher_feedback;
create policy "teacher_feedback_select_student_published_or_owner"
on public.teacher_feedback for select to authenticated
using (
  (is_published and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'
  ))
  or (teacher_id = auth.uid() and public.is_teacher())
);

drop policy if exists "teacher_feedback_teacher_insert_own" on public.teacher_feedback;
create policy "teacher_feedback_teacher_insert_own"
on public.teacher_feedback for insert to authenticated
with check (teacher_id = auth.uid() and public.is_teacher());

drop policy if exists "teacher_feedback_teacher_update_own" on public.teacher_feedback;
create policy "teacher_feedback_teacher_update_own"
on public.teacher_feedback for update to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());

drop policy if exists "teacher_feedback_teacher_delete_own" on public.teacher_feedback;
create policy "teacher_feedback_teacher_delete_own"
on public.teacher_feedback for delete to authenticated
using (teacher_id = auth.uid() and public.is_teacher());

grant select, insert, update, delete on public.teacher_feedback to authenticated;
