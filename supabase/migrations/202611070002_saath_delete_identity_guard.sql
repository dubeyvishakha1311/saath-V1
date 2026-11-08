-- Prevent an in-flight deletion from affecting a newly signed-in account.
drop function public.saath_delete_my_data();
create function public.saath_delete_my_data(expected_user_id uuid) returns void language plpgsql security invoker set search_path = '' as $$ begin if auth.uid() is null or auth.uid() is distinct from expected_user_id then raise exception 'Account identity changed; retry' using errcode = '42501'; end if; delete from public.saath_vaults where user_id = auth.uid(); end; $$;
revoke all on function public.saath_delete_my_data(uuid) from public, anon;
grant execute on function public.saath_delete_my_data(uuid) to authenticated;
