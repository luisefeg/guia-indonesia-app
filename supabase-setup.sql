-- Ejecutar en Supabase → SQL Editor → New query → Run

-- 1) Tabla única de datos compartidos (una fila por sección: tickets, stops, agenda, notas)
create table if not exists guia_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) Activar Row Level Security y permitir lectura/escritura a cualquiera con el enlace
--    (no hay login de usuarios; el control de acceso es "quien tiene el enlace de Vercel").
alter table guia_kv enable row level security;

create policy "guia_kv_select" on guia_kv for select using (true);
create policy "guia_kv_insert" on guia_kv for insert with check (true);
create policy "guia_kv_update" on guia_kv for update using (true);
create policy "guia_kv_delete" on guia_kv for delete using (true);

-- 3) Activar Realtime para esta tabla (para que los cambios lleguen solos a todos los móviles)
alter publication supabase_realtime add table guia_kv;

-- 4) Permisos para el bucket de archivos "guia-files" (fotos, audios, PDFs de tickets)
--    Crea antes el bucket en Storage → New bucket → nombre "guia-files" → Public bucket: ON
create policy "guia_files_select" on storage.objects for select using (bucket_id = 'guia-files');
create policy "guia_files_insert" on storage.objects for insert with check (bucket_id = 'guia-files');
create policy "guia_files_update" on storage.objects for update using (bucket_id = 'guia-files');
create policy "guia_files_delete" on storage.objects for delete using (bucket_id = 'guia-files');

