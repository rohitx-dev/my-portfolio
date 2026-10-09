import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Compile the real server modules with mocked external boundaries. No credentials,
// running website, live database, or additional test dependencies are required.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, Response, console,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return exports;
}
const rules = load('src/lib/documents/validation.ts');
const owner = 'ba4aa406-c726-4ed8-9e14-d886ffbda33e';
const id = 'df5aac36-4fcb-4b97-8bc5-81e688791132';
const details = { name: 'Project notes', description: '', filename: 'notes.pdf', mimeType: 'application/pdf', size: 12 };

function fixture(options = {}) {
  const calls = [];
  const store = {
    async createSignedUploadUrl(p, opts) { calls.push(['upload', p, opts]); return { data: { token: 'test-token' }, error: options.uploadError }; },
    async info(p) { calls.push(['info', p]); return { data: { size: options.size ?? 12, contentType: options.mime ?? 'application/pdf' }, error: options.infoError }; },
    async createSignedUrl(p, ttl, opts) { calls.push(['sign', p, ttl, opts]); return { data: { signedUrl: 'https://storage.example.test/download' }, error: options.signError }; },
  };
  const supabase = {
    storage: { from: () => store },
    auth: { getUser: async () => ({ data: { user: options.user === null ? null : { id: options.user ?? owner } }, error: null }) },
    from() {
      let mode = 'select';
      const q = {
        select() { return q; },
        eq(k, v) { calls.push(['filter', k, v]); return q; },
        insert(row) { calls.push(['insert', row]); return Promise.resolve({ error: options.insertError }); },
        update(row) { mode = 'update'; calls.push(['update', row]); return q; },
        async maybeSingle() {
          if (mode === 'update') return { data: options.missing ? null : { id }, error: options.updateError };
          return { data: options.document ?? (options.existing ? { id } : null), error: options.queryError };
        },
      };
      return q;
    },
  };
  const requireOwner = async () => {
    calls.push(['guard']);
    if (options.deny) throw new Error('unauthorized');
    return { supabase, user: { id: owner } };
  };
  const actions = load('src/app/admin/documents/actions.ts', {
    '../../../lib/auth/owner': { requireOwner },
    '../../../lib/documents/validation': rules,
    'next/cache': { revalidatePath: (p) => calls.push(['revalidate', p]) },
  });
  const route = load('src/app/docs/[id]/download/route.ts', {
    '../../../../lib/auth/owner': { OWNER_ID: owner },
    '../../../../lib/documents/validation': rules,
    '../../../../lib/supabase/server': { createClient: async () => supabase },
    'next/server': { NextResponse: { redirect: (url, init) => new Response(null, { ...init, headers: { ...init.headers, Location: url } }) } },
  });
  return { actions, route, calls };
}
const visibilityForm = (value) => {
  const f = new FormData(); f.set('id', id); f.set('visibility', value); return f;
};
const download = (fixture, documentId = id) => fixture.route.GET(new Request('https://example.test/docs/download'), { params: Promise.resolve({ id: documentId }) });

test('valid formats, empty browser MIME, and the exact 10 MB boundary', () => {
  for (const [filename, mimeType] of [['a.pdf','application/pdf'], ['a.txt','text/plain'], ['a.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['a.jpg','image/jpeg'], ['a.png','image/png'], ['a.jpeg','']]) {
    assert.ok(rules.parseUploadDetails({ ...details, filename, mimeType, size: rules.MAX_FILE_BYTES }).data);
  }
});

test('invalid sizes, names, filename paths, MIME mismatches, and unsupported files are rejected', () => {
  for (const patch of [{ size: 0 }, { size: rules.MAX_FILE_BYTES + 1 }, { size: NaN }, { size: 1.2 }, { size: '12' }, { name: ' ' }, { name: 'a'.repeat(161) }, { description: 'a'.repeat(2001) }, { filename: '../a.pdf' }, { filename: 'a\\b.pdf' }, { filename: 'a\nb.pdf' }, { filename: 'a.html' }, { filename: 'a.constructor', mimeType: '' }, { mimeType: 'text/html' }]) {
    assert.ok(rules.parseUploadDetails({ ...details, ...patch }).error, JSON.stringify(patch));
  }
});

test('all mutations require the owner before any storage/database request', async () => {
  const f = fixture({ deny: true });
  await assert.rejects(f.actions.prepareUpload(details), /unauthorized/);
  await assert.rejects(f.actions.finishUpload(id, details), /unauthorized/);
  await assert.rejects(f.actions.changeVisibility({}, visibilityForm('public')), /unauthorized/);
  assert.ok(f.calls.every(([kind]) => kind === 'guard'));
});

test('upload ticket is scoped to owner UUID and does not create a record', async () => {
  const f = fixture(); const result = await f.actions.prepareUpload(details);
  assert.ok(result.ticket.path.startsWith(owner + '/'));
  assert.ok(rules.isDocumentId(result.ticket.id));
  assert.equal(f.calls.find(([kind]) => kind === 'upload')[2].upsert, false);
  assert.equal(f.calls.some(([kind]) => kind === 'insert'), false);
});

test('invalid upload metadata and signing failures are handled', async () => {
  const f = fixture(); assert.ok((await f.actions.prepareUpload({ ...details, size: 0 })).error);
  assert.equal(f.calls.some(([kind]) => kind === 'upload'), false);
  assert.ok((await fixture({ uploadError: {} }).actions.prepareUpload(details)).error);
});

test('save verifies the stored file and forces private visibility', async () => {
  const f = fixture(); assert.ok((await f.actions.finishUpload(id, { ...details, visibility: 'public' })).success);
  const row = f.calls.find(([kind]) => kind === 'insert')[1];
  assert.equal(row.visibility, 'private'); assert.equal(row.owner_id, owner);
  assert.equal(row.size_bytes, 12);
  assert.equal(f.calls.find(([kind]) => kind === 'info')[1], `${owner}/${id}`);
});

test('missing/mismatched storage data never creates records', async () => {
  for (const opts of [{ infoError: {} }, { size: 13 }, { mime: 'text/html' }]) {
    const f = fixture(opts); assert.ok((await f.actions.finishUpload(id, details)).error);
    assert.equal(f.calls.some(([kind]) => kind === 'insert'), false);
  }
});

test('retry after an acknowledged database write is idempotent', async () => {
  const f = fixture({ existing: true }); assert.ok((await f.actions.finishUpload(id, details)).success);
  assert.equal(f.calls.some(([kind]) => kind === 'insert'), false);
  assert.equal(f.calls.some(([kind]) => kind === 'info'), false);
});

test('failed record save remains retryable and no public record is created', async () => {
  const f = fixture({ insertError: {} }); assert.match((await f.actions.finishUpload(id, details)).error, /Retry saving/);
  assert.equal(f.calls.find(([kind]) => kind === 'insert')[1].visibility, 'private');
});

test('visibility validates input, scopes the update to the owner, and refreshes both pages', async () => {
  const f = fixture(); assert.ok((await f.actions.changeVisibility({}, visibilityForm('public'))).success);
  assert.ok(f.calls.some(c => c[0] === 'filter' && c[1] === 'owner_id' && c[2] === owner));
  assert.ok(f.calls.some(c => c[0] === 'revalidate' && c[1] === '/docs'));
  assert.ok(f.calls.some(c => c[0] === 'revalidate' && c[1] === '/admin/documents'));
  assert.ok((await f.actions.changeVisibility({}, visibilityForm('invalid'))).error);
});

test('missing file cannot be published, but can be made private', async () => {
  const f = fixture({ infoError: {} }); assert.ok((await f.actions.changeVisibility({}, visibilityForm('public'))).error);
  assert.equal(f.calls.some(([kind]) => kind === 'update'), false);
  assert.ok((await f.actions.changeVisibility({}, visibilityForm('private'))).success);
});

test('a missing document returns a visibility error instead of false success', async () => {
  assert.ok((await fixture({ missing: true }).actions.changeVisibility({}, visibilityForm('private'))).error);
});

const privateDocument = { owner_id: owner, visibility: 'private', storage_path: `${owner}/${id}`, original_filename: 'notes.pdf' };
test('anonymous and other users cannot download private files even if a record is returned', async () => {
  for (const user of [null, 'someone-else']) {
    const f = fixture({ document: privateDocument, user }); const res = await download(f);
    assert.equal(res.status, 404); assert.equal(f.calls.some(([kind]) => kind === 'sign'), false);
  }
});

test('owner can download private files; links have short TTL and responses are not cached', async () => {
  const f = fixture({ document: privateDocument }); const res = await download(f);
  assert.equal(res.status, 303); assert.match(res.headers.get('Cache-Control'), /no-store/);
  const sign = f.calls.find(([kind]) => kind === 'sign');
  assert.equal(sign[2], 60); assert.equal(sign[3].download, 'notes.pdf');
});

test('public downloads work without a signed-in user', async () => {
  const f = fixture({ document: { ...privateDocument, visibility: 'public' }, user: null });
  assert.equal((await download(f)).status, 303);
});

test('malformed IDs, missing records, and unavailable files never redirect', async () => {
  assert.equal((await download(fixture(), '../bad')).status, 404);
  assert.equal((await download(fixture())).status, 404);
  assert.equal((await download(fixture({ document: privateDocument, signError: {} }))).status, 404);
  assert.equal((await download(fixture({ queryError: {} }))).status, 503);
});
