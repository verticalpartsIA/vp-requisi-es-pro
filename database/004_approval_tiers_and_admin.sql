alter table public.user_roles
  add column if not exists approval_tier integer
  check (approval_tier between 1 and 3);

create or replace function private.can_approve_level(target_level integer)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select
    private.has_role('admin')
    or exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'aprovador'
        and coalesce(approval_tier, 0) >= target_level
    );
$$;

grant execute on function private.can_approve_level(integer) to authenticated;

drop policy if exists approvals_update_aprovador on public.approvals;

create policy approvals_update_aprovador
on public.approvals
for update
to authenticated
using (
  decision = 'pending'
  and private.can_approve_level(approval_level)
)
with check (
  private.can_approve_level(approval_level)
);
