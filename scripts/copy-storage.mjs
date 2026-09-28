// One-off: copy every object in the admin's storage buckets from the old
// Supabase project to the new one. Moving the database copies the rows that
// point at these files (cover_url, gallery, file_path), not the files
// themselves.
//
// Reads from the old project with its publishable/anon key (the buckets are
// public and have a public SELECT policy, so listing and downloading work
// without a login) and writes to the new one with its service_role key, which
// bypasses storage RLS. Skips objects that already exist, so it is safe to
// re-run.
//
//   OLD_SUPABASE_URL=https://wirkzblhhfrqbywrtoze.supabase.co \
//   OLD_SUPABASE_KEY=<old publishable/anon key> \
//   NEW_SUPABASE_URL=https://llpdkkjlbdsoqwqmbpcb.supabase.co \
//   NEW_SUPABASE_SERVICE_ROLE_KEY=<new service_role key> \
//   node scripts/copy-storage.mjs

import { createClient } from '@supabase/supabase-js';

const BUCKETS = ['blog-covers', 'website-media', 'website-documents'];

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const opts = { auth: { persistSession: false } };
const oldDb = createClient(env('OLD_SUPABASE_URL'), env('OLD_SUPABASE_KEY'), opts);
const newDb = createClient(env('NEW_SUPABASE_URL'), env('NEW_SUPABASE_SERVICE_ROLE_KEY'), opts);

// storage.list() is one folder level at a time; folders come back with id null.
async function listAll(client, bucket, prefix = '') {
  const paths = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) paths.push(...(await listAll(client, bucket, path)));
      else if (entry.name !== '.emptyFolderPlaceholder') paths.push(path);
    }
    if (data.length < 1000) return paths;
  }
}

let failed = 0;
for (const bucket of BUCKETS) {
  const [source, existing] = await Promise.all([listAll(oldDb, bucket), listAll(newDb, bucket)]);
  const have = new Set(existing);
  const todo = source.filter((path) => !have.has(path));
  console.log(`${bucket}: ${source.length} in old project, ${todo.length} to copy`);

  for (const path of todo) {
    const { data: blob, error: downloadError } = await oldDb.storage.from(bucket).download(path);
    if (downloadError) {
      failed++;
      console.error(`  ✗ ${path}: download failed — ${downloadError.message}`);
      continue;
    }
    const { error: uploadError } = await newDb.storage
      .from(bucket)
      .upload(path, blob, { contentType: blob.type || undefined, cacheControl: '31536000', upsert: false });
    if (uploadError) {
      failed++;
      console.error(`  ✗ ${path}: upload failed — ${uploadError.message}`);
    } else {
      console.log(`  ✓ ${path}`);
    }
  }
}

if (failed) {
  console.error(`${failed} object(s) failed`);
  process.exit(1);
}
console.log('Done.');
