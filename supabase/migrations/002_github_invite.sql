-- Lookup user by GitHub username (stored in OAuth metadata)
create or replace function public.get_user_id_by_github(github_username text)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from auth.users
  where lower(raw_user_meta_data->>'user_name') = lower(github_username)
     or lower(raw_user_meta_data->>'preferred_username') = lower(github_username)
  limit 1;
$$;
