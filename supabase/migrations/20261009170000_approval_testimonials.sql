alter table public.testimonials
  add column if not exists exam_name text,
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null,
  add column if not exists is_published boolean not null default false;

alter table public.testimonials enable row level security;

alter table public.testimonials drop constraint if exists testimonials_name_length_check;
alter table public.testimonials add constraint testimonials_name_length_check
  check (char_length(trim(name)) between 2 and 120);

alter table public.testimonials drop constraint if exists testimonials_content_length_check;
alter table public.testimonials add constraint testimonials_content_length_check
  check (char_length(trim(content)) between 10 and 1800);

alter table public.testimonials drop constraint if exists testimonials_exam_name_length_check;
alter table public.testimonials add constraint testimonials_exam_name_length_check
  check (exam_name is null or char_length(trim(exam_name)) between 2 and 160);

alter table public.testimonials drop constraint if exists testimonials_role_length_check;
alter table public.testimonials add constraint testimonials_role_length_check
  check (role is null or char_length(trim(role)) <= 120);

drop policy if exists testimonials_public_select on public.testimonials;
drop policy if exists testimonials_select_public_or_owner on public.testimonials;
drop policy if exists testimonials_teacher_insert_own on public.testimonials;
drop policy if exists testimonials_teacher_update_own on public.testimonials;
drop policy if exists testimonials_teacher_delete_own on public.testimonials;

create policy testimonials_select_public_or_owner
on public.testimonials for select
to anon, authenticated
using (
  is_published = true
  or (teacher_id = (select auth.uid()) and (select public.is_teacher()))
);

create policy testimonials_teacher_insert_own
on public.testimonials for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and (select public.is_teacher())
);

create policy testimonials_teacher_update_own
on public.testimonials for update
to authenticated
using (
  teacher_id = (select auth.uid())
  and (select public.is_teacher())
)
with check (
  teacher_id = (select auth.uid())
  and (select public.is_teacher())
);

create policy testimonials_teacher_delete_own
on public.testimonials for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and (select public.is_teacher())
);

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
revoke insert, update, delete on public.testimonials from anon;

create index if not exists testimonials_published_created_at_idx
on public.testimonials (created_at desc)
where is_published = true;
