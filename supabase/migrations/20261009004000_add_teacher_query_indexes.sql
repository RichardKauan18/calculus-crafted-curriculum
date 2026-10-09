create index if not exists idx_lessons_teacher_id
  on public.lessons (teacher_id);

create index if not exists idx_teacher_feedback_teacher_created_at
  on public.teacher_feedback (teacher_id, created_at desc);
