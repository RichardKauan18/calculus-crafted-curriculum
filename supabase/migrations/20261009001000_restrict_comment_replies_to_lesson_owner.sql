create or replace function public.reply_to_comment(p_comment_id uuid, p_reply text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_teacher() then
    raise exception 'Only teachers can reply';
  end if;

  if p_reply is null or trim(p_reply) = '' then
    raise exception 'Reply cannot be empty';
  end if;

  update public.comments c
  set reply = trim(p_reply),
      replied_by = auth.uid(),
      replied_at = now()
  from public.lessons l
  where c.id = p_comment_id
    and l.id = c.lesson_id
    and l.teacher_id = auth.uid();

  if not found then
    raise exception 'Comment not found or lesson is not owned by this teacher';
  end if;
end;
$function$;
