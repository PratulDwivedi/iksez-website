create type public.t_request_context as (
  tenant_id integer,
  user_id integer,
  caller_id integer,
  allowed_schema text,
  role_ids integer[],
  is_admin boolean,
  request_id text,
  scopes text[],
  auth_method text,
  is_host boolean,
  role_code text
);