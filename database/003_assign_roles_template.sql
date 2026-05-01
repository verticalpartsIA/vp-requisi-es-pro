-- Execute after creating real auth users in Supabase Auth.
-- Replace the email addresses below with the real VerticalParts users.

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'admin@verticalparts.com.br'
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'comprador'::public.app_role
from auth.users
where email = 'comprador@verticalparts.com.br'
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'aprovador'::public.app_role
from auth.users
where email = 'aprovador@verticalparts.com.br'
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'almoxarife'::public.app_role
from auth.users
where email = 'almoxarife@verticalparts.com.br'
on conflict (user_id, role) do nothing;

-- Most users keep the default 'solicitante' role created by trigger public.handle_new_user().
