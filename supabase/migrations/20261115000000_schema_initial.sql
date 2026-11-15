-- Schéma initial de Barber Tieks.
-- Tout accès passe par le serveur Next.js (clé service_role).
-- RLS est activé sans aucune policy : les clés anon/authenticated ne lisent ni n'écrivent rien.

create type item_kind as enum ('service', 'product');
create type payment_method as enum ('cash', 'card', 'transfer');

create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table catalog_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  kind item_kind not null,
  price_cents integer not null check (price_cents > 0),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Une vente = un article. Nom, type et prix sont copiés au moment de la vente
-- pour qu'un changement de tarif ne modifie pas l'historique.
create table sales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  catalog_item_id uuid not null references catalog_items (id),
  item_name text not null,
  kind item_kind not null,
  price_cents integer not null check (price_cents > 0),
  payment_method payment_method not null,
  employee_id uuid not null references employees (id)
);

create index sales_created_at_idx on sales (created_at);

alter table employees enable row level security;
alter table catalog_items enable row level security;
alter table sales enable row level security;

-- Règle V1 : une vente saisie ne peut être ni modifiée ni supprimée.
create function forbid_sale_change() returns trigger
language plpgsql as $$
begin
  raise exception 'Une vente saisie ne peut pas être modifiée ni supprimée';
end;
$$;

create trigger sales_immutable
  before update or delete on sales
  for each row execute function forbid_sale_change();

-- Catalogue réel du salon (fiche projet).
insert into catalog_items (name, kind, price_cents, position) values
  ('Coupe signature', 'service', 1500, 1),
  ('Coupe avec barbe et soin', 'service', 2500, 2),
  ('Barbe avec soin', 'service', 1000, 3),
  ('Soin du visage', 'service', 1000, 4),
  ('Épilation nez/oreilles', 'service', 500, 5),
  ('Coupe enfant (-12 ans)', 'service', 1200, 6),
  ('Coupe et barbe senior', 'service', 2000, 7),
  ('Rasage tête et barbe avec soin', 'service', 2000, 8),
  ('Formule Prestige', 'service', 3000, 9),
  ('Poudre texture', 'product', 1000, 10),
  ('Cire', 'product', 1000, 11),
  ('Gel', 'product', 1000, 12),
  ('Eau de cologne', 'product', 1000, 13);
