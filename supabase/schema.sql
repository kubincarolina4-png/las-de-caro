-- ============================================================
-- Las de Caro — esquema de Supabase
-- Copiá y pegá TODO este archivo en el "SQL Editor" de tu
-- proyecto de Supabase, y tocá "Run". Se puede correr una sola vez.
-- ============================================================

-- 1) Tabla simple de clave/valor donde vive el catálogo,
--    los ajustes de la tienda, y la lista de emails del newsletter.
create table if not exists store_kv (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table store_kv enable row level security;

-- Cualquiera puede LEER (así la tienda pública carga sin login)
create policy "lectura publica store_kv"
  on store_kv for select
  using (true);

-- Cualquiera con la clave pública (anon) puede ESCRIBIR.
-- Ojo: esto es intencional por ahora (no hay backend propio todavía),
-- ver la nota de seguridad en el README antes de publicar.
create policy "insertar publico store_kv"
  on store_kv for insert
  with check (true);

create policy "actualizar publico store_kv"
  on store_kv for update
  using (true);

create policy "borrar publico store_kv"
  on store_kv for delete
  using (true);


-- 2) Bucket de Storage para las fotos de productos.
--    (Este paso también se puede hacer a mano desde Storage → New bucket,
--     pero así queda documentado y repetible.)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Cualquiera puede VER las fotos (son fotos de productos, públicas por diseño)
create policy "lectura publica product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Cualquiera con la clave pública puede SUBIR fotos
create policy "subida publica product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- Cualquiera con la clave pública puede REEMPLAZAR fotos
create policy "actualizacion publica product-images"
  on storage.objects for update
  using (bucket_id = 'product-images');

-- Cualquiera con la clave pública puede BORRAR fotos
create policy "borrado publico product-images"
  on storage.objects for delete
  using (bucket_id = 'product-images');
