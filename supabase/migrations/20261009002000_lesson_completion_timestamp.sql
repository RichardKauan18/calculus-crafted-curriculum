alter table public.lesson_progress
  add column if not exists completed_at timestamptz;

-- Backfill historical completed records with the best timestamp available.
update public.lesson_progress
set completed_at = updated_at
where status = 'completed'
  and completed_at is null;
