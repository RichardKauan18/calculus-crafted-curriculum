DO $$
DECLARE
  pol record;
  roles_sql text;
  qual_sql text;
  check_sql text;
  cmd_sql text;
  permissive_sql text;
  create_sql text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check, permissive
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (coalesce(qual, '') ~* 'auth\.uid\(\)' AND coalesce(qual, '') !~* '\(\s*select\s+auth\.uid\(\)')
        OR
        (coalesce(with_check, '') ~* 'auth\.uid\(\)' AND coalesce(with_check, '') !~* '\(\s*select\s+auth\.uid\(\)')
      )
  LOOP
    SELECT string_agg(quote_ident(r), ', ')
      INTO roles_sql
      FROM unnest(pol.roles) AS r;

    qual_sql := pol.qual;
    check_sql := pol.with_check;
    IF qual_sql IS NOT NULL THEN
      qual_sql := regexp_replace(qual_sql, 'auth\.uid\(\)', '(select auth.uid())', 'gi');
    END IF;
    IF check_sql IS NOT NULL THEN
      check_sql := regexp_replace(check_sql, 'auth\.uid\(\)', '(select auth.uid())', 'gi');
    END IF;

    cmd_sql := CASE upper(pol.cmd)
      WHEN 'SELECT' THEN 'SELECT'
      WHEN 'INSERT' THEN 'INSERT'
      WHEN 'UPDATE' THEN 'UPDATE'
      WHEN 'DELETE' THEN 'DELETE'
      ELSE 'ALL'
    END;
    permissive_sql := CASE pol.permissive WHEN 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END;

    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    create_sql := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      pol.policyname, pol.schemaname, pol.tablename, permissive_sql, cmd_sql, roles_sql
    );
    IF qual_sql IS NOT NULL THEN
      create_sql := create_sql || format(' USING (%s)', qual_sql);
    END IF;
    IF check_sql IS NOT NULL THEN
      create_sql := create_sql || format(' WITH CHECK (%s)', check_sql);
    END IF;
    EXECUTE create_sql;
  END LOOP;
END $$;