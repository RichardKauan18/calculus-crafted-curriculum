alter table public.concursos
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null;

create index if not exists concursos_teacher_id_idx on public.concursos(teacher_id);

drop policy if exists concursos_teacher_insert on public.concursos;
drop policy if exists concursos_teacher_update on public.concursos;
drop policy if exists concursos_teacher_delete on public.concursos;

create policy concursos_teacher_insert
  on public.concursos for insert to authenticated
  with check (public.is_teacher() and teacher_id = auth.uid());

create policy concursos_teacher_update
  on public.concursos for update to authenticated
  using (public.is_teacher() and teacher_id = auth.uid())
  with check (public.is_teacher() and teacher_id = auth.uid());

create policy concursos_teacher_delete
  on public.concursos for delete to authenticated
  using (public.is_teacher() and teacher_id = auth.uid());

grant select on public.concursos to anon, authenticated;
grant insert, update, delete on public.concursos to authenticated;
