-- This script is run by db-init as the local admin role.
-- psql supplies :dashboard_db_password at runtime; no password is stored here.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'dashboard_user') then
    create role dashboard_user login nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
  end if;
end
$$;

alter role dashboard_user password :'dashboard_db_password';

revoke all on database localdb from public;
revoke all on schema public from public;

grant connect on database localdb to dashboard_user;
grant usage on schema public to dashboard_user;
grant select, insert, update, delete on all tables in schema public to dashboard_user;
grant usage, select on all sequences in schema public to dashboard_user;

alter default privileges for role app in schema public
  grant select, insert, update, delete on tables to dashboard_user;
alter default privileges for role app in schema public
  grant usage, select on sequences to dashboard_user;
