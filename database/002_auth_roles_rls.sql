create schema if not exists private;

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;

grant usage, select on all sequences in schema public to authenticated;

revoke all on public.profiles from anon;
revoke all on public.user_roles from anon;
revoke all on public.requisitions from anon;
revoke all on public.quotations from anon;
revoke all on public.quotation_suppliers from anon;
revoke all on public.approvals from anon;
revoke all on public.purchases from anon;
revoke all on public.receipts from anon;
revoke all on public.audit_logs from anon;

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant insert, update, delete on public.user_roles to authenticated;
grant select, insert, update on public.requisitions to authenticated;
grant select, insert, update, delete on public.quotations to authenticated;
grant select, insert, update, delete on public.quotation_suppliers to authenticated;
grant select, insert, update on public.approvals to authenticated;
grant select, insert, update on public.purchases to authenticated;
grant select, insert, update on public.receipts to authenticated;
grant select, insert on public.audit_logs to authenticated;

alter table public.requisitions
  alter column created_by set default auth.uid();

alter table public.requisitions
  alter column requester_profile_id set default auth.uid();

alter table public.quotations
  alter column buyer_id set default auth.uid();

alter table public.purchases
  alter column buyer_id set default auth.uid();

alter table public.receipts
  alter column received_by set default auth.uid();

create or replace function private.has_role(check_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = check_role
  );
$$;

create or replace function private.has_any_role(check_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = any(check_roles)
  );
$$;

create or replace function private.can_view_requisition(target_requisition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.requisitions
    where id = target_requisition_id
      and (
        created_by = auth.uid()
        or requester_profile_id = auth.uid()
        or private.has_any_role(array['admin', 'comprador', 'aprovador', 'almoxarife']::public.app_role[])
      )
  );
$$;

grant execute on function private.has_role(public.app_role) to authenticated;
grant execute on function private.has_any_role(public.app_role[]) to authenticated;
grant execute on function private.can_view_requisition(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, department, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'department',
    new.email
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    department = coalesce(excluded.department, public.profiles.department),
    email = excluded.email,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'solicitante')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create or replace function public.set_audit_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.actor_id is null then
    new.actor_id := auth.uid();
  end if;

  if new.actor_name is null and new.actor_id is not null then
    select full_name
    into new.actor_name
    from public.profiles
    where id = new.actor_id;
  end if;

  return new;
end;
$$;

drop trigger if exists audit_logs_set_actor on public.audit_logs;
create trigger audit_logs_set_actor
before insert on public.audit_logs
for each row execute function public.set_audit_actor();

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists user_roles_select_own on public.user_roles;
drop policy if exists requisitions_authenticated_all on public.requisitions;
drop policy if exists quotations_authenticated_all on public.quotations;
drop policy if exists quotation_suppliers_authenticated_all on public.quotation_suppliers;
drop policy if exists approvals_authenticated_all on public.approvals;
drop policy if exists purchases_authenticated_all on public.purchases;
drop policy if exists receipts_authenticated_all on public.receipts;
drop policy if exists audit_logs_authenticated_read on public.audit_logs;

create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or private.has_role('admin')
);

create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or private.has_role('admin')
)
with check (
  auth.uid() = id
  or private.has_role('admin')
);

create policy user_roles_select_self_or_admin
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or private.has_role('admin')
);

create policy user_roles_manage_admin
on public.user_roles
for all
to authenticated
using (private.has_role('admin'))
with check (private.has_role('admin'));

create policy requisitions_select_authorized
on public.requisitions
for select
to authenticated
using (private.can_view_requisition(id));

create policy requisitions_insert_owner
on public.requisitions
for insert
to authenticated
with check (
  created_by = auth.uid()
  and requester_profile_id = auth.uid()
);

create policy requisitions_update_owner
on public.requisitions
for update
to authenticated
using (
  auth.uid() = created_by
  and status in ('RASCUNHO', 'ABERTO', 'REJEITADO')
)
with check (
  auth.uid() = created_by
  and requester_profile_id = auth.uid()
);

create policy requisitions_update_comprador
on public.requisitions
for update
to authenticated
using (
  private.has_any_role(array['admin', 'comprador']::public.app_role[])
  and status in ('ABERTO', 'COTAÇÃO', 'COMPRA', 'RECEBIMENTO')
)
with check (
  private.has_any_role(array['admin', 'comprador']::public.app_role[])
);

create policy requisitions_update_aprovador
on public.requisitions
for update
to authenticated
using (
  private.has_any_role(array['admin', 'aprovador']::public.app_role[])
  and status in ('APROVAÇÃO', 'REJEITADO')
)
with check (
  private.has_any_role(array['admin', 'aprovador']::public.app_role[])
);

create policy requisitions_update_almoxarife
on public.requisitions
for update
to authenticated
using (
  private.has_any_role(array['admin', 'almoxarife']::public.app_role[])
  and status = 'RECEBIMENTO'
)
with check (
  private.has_any_role(array['admin', 'almoxarife']::public.app_role[])
);

create policy quotations_select_authorized
on public.quotations
for select
to authenticated
using (private.can_view_requisition(requisition_id));

create policy quotations_manage_comprador
on public.quotations
for all
to authenticated
using (private.has_any_role(array['admin', 'comprador']::public.app_role[]))
with check (private.has_any_role(array['admin', 'comprador']::public.app_role[]));

create policy quotation_suppliers_select_authorized
on public.quotation_suppliers
for select
to authenticated
using (
  exists (
    select 1
    from public.quotations
    where public.quotations.id = quotation_id
      and private.can_view_requisition(public.quotations.requisition_id)
  )
);

create policy quotation_suppliers_manage_comprador
on public.quotation_suppliers
for all
to authenticated
using (private.has_any_role(array['admin', 'comprador']::public.app_role[]))
with check (private.has_any_role(array['admin', 'comprador']::public.app_role[]));

create policy approvals_select_authorized
on public.approvals
for select
to authenticated
using (private.can_view_requisition(requisition_id));

create policy approvals_insert_comprador
on public.approvals
for insert
to authenticated
with check (private.has_any_role(array['admin', 'comprador']::public.app_role[]));

create policy approvals_update_aprovador
on public.approvals
for update
to authenticated
using (
  private.has_any_role(array['admin', 'aprovador']::public.app_role[])
  and decision = 'pending'
)
with check (
  private.has_any_role(array['admin', 'aprovador']::public.app_role[])
);

create policy purchases_select_authorized
on public.purchases
for select
to authenticated
using (private.can_view_requisition(requisition_id));

create policy purchases_manage_comprador
on public.purchases
for all
to authenticated
using (private.has_any_role(array['admin', 'comprador']::public.app_role[]))
with check (private.has_any_role(array['admin', 'comprador']::public.app_role[]));

create policy receipts_select_authorized
on public.receipts
for select
to authenticated
using (private.can_view_requisition(requisition_id));

create policy receipts_manage_almoxarife
on public.receipts
for all
to authenticated
using (private.has_any_role(array['admin', 'almoxarife']::public.app_role[]))
with check (private.has_any_role(array['admin', 'almoxarife']::public.app_role[]));

create policy audit_logs_select_authorized
on public.audit_logs
for select
to authenticated
using (
  private.has_role('admin')
  or (requisition_id is not null and private.can_view_requisition(requisition_id))
);

create policy audit_logs_insert_authenticated
on public.audit_logs
for insert
to authenticated
with check (
  auth.uid() is not null
  and (actor_id is null or actor_id = auth.uid())
);
