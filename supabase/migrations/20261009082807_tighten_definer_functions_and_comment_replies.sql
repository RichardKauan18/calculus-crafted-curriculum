CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

ALTER FUNCTION public.is_teacher() SET SCHEMA private;
REVOKE ALL ON FUNCTION private.is_teacher() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_teacher() TO authenticated;

CREATE OR REPLACE FUNCTION public.reply_to_comment(p_comment_id uuid, p_reply text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_teacher() THEN
    RAISE EXCEPTION 'Only authenticated teachers can reply';
  END IF;

  IF p_reply IS NULL OR char_length(btrim(p_reply)) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Reply must contain between 1 and 2000 characters';
  END IF;

  UPDATE public.comments c
  SET reply = btrim(p_reply),
      replied_by = auth.uid(),
      replied_at = now()
  FROM public.lessons l
  WHERE c.id = p_comment_id
    AND l.id = c.lesson_id
    AND l.teacher_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found or lesson is not owned by this teacher';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.reply_to_comment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reply_to_comment(uuid, text) TO authenticated;

DROP POLICY IF EXISTS comments_teacher_reply_owned_lesson ON public.comments;
CREATE POLICY comments_teacher_reply_owned_lesson
ON public.comments
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  (select private.is_teacher())
  AND EXISTS (
    SELECT 1
    FROM public.lessons l
    WHERE l.id = comments.lesson_id
      AND l.teacher_id = (select auth.uid())
  )
)
WITH CHECK (
  (select private.is_teacher())
  AND EXISTS (
    SELECT 1
    FROM public.lessons l
    WHERE l.id = comments.lesson_id
      AND l.teacher_id = (select auth.uid())
  )
);

REVOKE UPDATE ON public.comments FROM anon, authenticated;
GRANT UPDATE (reply, replied_by, replied_at) ON public.comments TO authenticated;