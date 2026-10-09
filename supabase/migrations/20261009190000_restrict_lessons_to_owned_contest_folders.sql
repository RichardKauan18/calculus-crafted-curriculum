drop policy if exists lessons_teacher_insert on public.lessons;
create policy lessons_teacher_insert
  on public.lessons for insert to authenticated
  with check (
    public.is_teacher()
    and teacher_id = auth.uid()
    and (
      concurso_id is null
      or exists (
        select 1 from public.concursos c
        where c.id = concurso_id and c.teacher_id = auth.uid()
      )
    )
  );

drop policy if exists lessons_teacher_update on public.lessons;
create policy lessons_teacher_update
  on public.lessons for update to authenticated
  using (public.is_teacher() and teacher_id = auth.uid())
  with check (
    public.is_teacher()
    and teacher_id = auth.uid()
    and (
      concurso_id is null
      or exists (
        select 1 from public.concursos c
        where c.id = concurso_id and c.teacher_id = auth.uid()
      )
    )
  );