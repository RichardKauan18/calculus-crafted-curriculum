alter table public.lessons drop constraint if exists lessons_concurso_fk;
alter table public.lessons
  add constraint lessons_concurso_fk
  foreign key (concurso_id) references public.concursos(id) on delete set null;