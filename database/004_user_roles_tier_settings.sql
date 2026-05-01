-- Adiciona coluna de alçada de aprovação na tabela user_roles
alter table public.user_roles
  add column if not exists approval_tier smallint check (approval_tier in (1, 2, 3));

comment on column public.user_roles.approval_tier is
  '1 = até R$1.500 | 2 = R$1.500,01-R$3.500 | 3 = acima de R$3.500 — somente para role=aprovador';

-- Configurações globais do sistema (thresholds de alçadas)
create table if not exists public.settings (
  key   text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

grant select            on public.settings to authenticated;
grant insert, update    on public.settings to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'settings' and policyname = 'settings_select_authenticated'
  ) then
    create policy settings_select_authenticated
    on public.settings for select to authenticated
    using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'settings' and policyname = 'settings_manage_admin'
  ) then
    create policy settings_manage_admin
    on public.settings for all to authenticated
    using  (private.has_role('admin'))
    with check (private.has_role('admin'));
  end if;
end;
$$;

-- Valores padrão dos thresholds
insert into public.settings (key, value) values
  ('tier1_max', '1500.00'),
  ('tier2_max', '3500.00')
on conflict (key) do nothing;
