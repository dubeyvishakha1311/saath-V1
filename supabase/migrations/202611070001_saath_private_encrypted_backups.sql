-- Applied to the connected project via the Supabase connector. No plaintext
-- notebook fields, authentication secrets, or passphrases are stored here.
create table public.saath_vaults (
 user_id uuid primary key references auth.users(id) on delete cascade,
 ciphertext text not null check (length(ciphertext) between 24 and 3145728 and ciphertext ~ '^[A-Za-z0-9+/]+={0,2}$'),
 iv text not null check (length(iv) = 16 and iv ~ '^[A-Za-z0-9+/]+={0,2}$'),
 salt text not null check (length(salt) = 24 and salt ~ '^[A-Za-z0-9+/]+={0,2}$'),
 kdf_iterations integer not null default 600000 check (kdf_iterations = 600000),
 format_version integer not null default 1 check (format_version = 1),
 consent_version text not null check (consent_version = 'cloud-backup-v1'),
 revision bigint not null default 1 check (revision > 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.saath_vaults enable row level security;
alter table public.saath_vaults force row level security;
revoke all on public.saath_vaults from anon, authenticated;
grant select, insert, update, delete on public.saath_vaults to authenticated;
grant all on public.saath_vaults to service_role;
create policy saath_vault_select_own on public.saath_vaults for select to authenticated using ((select auth.uid()) = user_id);
create policy saath_vault_insert_own on public.saath_vaults for insert to authenticated with check ((select auth.uid()) = user_id);
create policy saath_vault_update_own on public.saath_vaults for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy saath_vault_delete_own on public.saath_vaults for delete to authenticated using ((select auth.uid()) = user_id);
create function public.saath_stamp_vault() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at := pg_catalog.now(); new.revision := old.revision + 1; return new; end; $$;
create trigger saath_vault_updated before update on public.saath_vaults for each row execute function public.saath_stamp_vault();
create function public.saath_delete_my_data() returns void language plpgsql security invoker set search_path = '' as $$ begin if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if; delete from public.saath_vaults where user_id = auth.uid(); end; $$;
revoke all on function public.saath_delete_my_data() from public, anon;
grant execute on function public.saath_delete_my_data() to authenticated;
