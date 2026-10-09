drop policy if exists testimonials_select_public_or_owner on public.testimonials;

create policy testimonials_public_select
on public.testimonials for select
to anon
using (is_published = true);

create policy testimonials_authenticated_select
on public.testimonials for select
to authenticated
using (
  is_published = true
  or (teacher_id = (select auth.uid()) and (select public.is_teacher()))
);

create index if not exists testimonials_teacher_id_idx
on public.testimonials (teacher_id);
