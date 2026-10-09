import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const owner = 'ba4aa406-c726-4ed8-9e14-d886ffbda33e';
const id = 'df5aac36-4fcb-4b97-8bc5-81e688791132';
function compile(file, mocks = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: name => {
    if (!(name in mocks)) throw Error('Unexpected import ' + name);
    return mocks[name];
  } });
  return exports;
}
const rules = compile('src/lib/documents/validation.ts');
function fixture(opts = {}) {
  const calls = [];
  let row = opts.missing ? null : { id, name: 'Before', description: '', deletion_pending: false, visibility: 'public' };
  let fileExists = !opts.fileMissing;
  const supabase = {
    storage: { from(bucket) {
      assert.equal(bucket, rules.DOCUMENT_BUCKET);
      return { async remove(paths) {
        calls.push(['remove', ...paths]);
        if (opts.storageThrow) throw Error('network');
        if (opts.storageError) return { error: {} };
        fileExists = false;
        return { data: [], error: null };
      } };
    } },
    from(table) {
      assert.equal(table, 'documents');
      let mode, values; const filters = {};
      const execute = () => {
        calls.push([mode, { ...filters }, values]);
        assert.equal(filters.owner_id, owner);
        assert.equal(filters.id, id);
        if (mode === 'delete') {
          if (opts.recordError) return { error: {} };
          if (row?.deletion_pending) row = null;
          return { error: null };
        }
        if (opts.updateError) return { data: null, error: {} };
        if (!row || (filters.deletion_pending === false && row.deletion_pending)) return { data: null, error: null };
        Object.assign(row, values);
        return { data: { id }, error: null };
      };
      const query = {
        update(v) { mode = 'update'; values = v; return query; },
        delete() { mode = 'delete'; return query; },
        eq(k, v) { filters[k] = v; return query; },
        select() { return query; },
        maybeSingle: async () => execute(),
        then(resolve, reject) { return Promise.resolve().then(execute).then(resolve, reject); },
      };
      return query;
    },
  };
  const actions = compile('src/app/admin/documents/manage-actions.ts', {
    '../../../lib/auth/owner': { requireOwner: async () => {
      calls.push(['guard']);
      if (opts.deny) throw Error('unauthorized');
      return { supabase, user: { id: owner } };
    } },
    '../../../lib/documents/validation': rules,
    'next/cache': { revalidatePath: p => calls.push(['refresh', p]) },
  });
  return { actions, calls, opts, row: () => row, fileExists: () => fileExists };
}
function form(values = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ id, name: ' Updated ', description: ' New description ', confirm: 'delete', ...values })) f.set(k, v);
  return f;
}

test('both actions authorize before database/storage access', async () => {
  const f = fixture({ deny: true });
  await assert.rejects(f.actions.editDocument({}, form()), /unauthorized/);
  await assert.rejects(f.actions.deleteDocument({}, form()), /unauthorized/);
  assert.ok(f.calls.every(c => c[0] === 'guard'));
});
test('edit validates IDs, names and descriptions without writes', async () => {
  for (const values of [{ id: 'bad' }, { name: ' ' }, { name: 'a'.repeat(161) }, { description: 'a'.repeat(2001) }]) {
    const f = fixture(); assert.ok((await f.actions.editDocument({}, form(values))).error);
    assert.ok(f.calls.every(c => c[0] === 'guard'));
  }
});
test('edit only updates trimmed name/description and refreshes both views', async () => {
  const f = fixture(); assert.ok((await f.actions.editDocument({}, form({ visibility: 'private', storage_path: 'other/file' }))).success);
  assert.equal(f.row().name, 'Updated'); assert.equal(f.row().description, 'New description');
  assert.equal(f.row().visibility, 'public');
  const write = f.calls.find(c => c[0] === 'update');
  assert.deepEqual(Object.keys(write[2]).sort(), ['description', 'name']);
  assert.equal(write[1].deletion_pending, false);
  assert.ok(f.calls.some(c => c[1] === '/docs'));
  assert.ok(f.calls.some(c => c[1] === '/admin/documents'));
});
test('edit handles missing records and database failures', async () => {
  for (const opts of [{ missing: true }, { updateError: true }]) assert.ok((await fixture(opts).actions.editDocument({}, form())).error);
});
test('delete requires explicit confirmation and valid ID', async () => {
  for (const values of [{ confirm: '' }, { id: 'bad' }]) {
    const f = fixture(); assert.ok((await f.actions.deleteDocument({}, form(values))).error);
    assert.equal(f.calls.length, 1);
  }
});
test('deletion hides first, removes owner-scoped file, then deletes record', async () => {
  const f = fixture(); assert.ok((await f.actions.deleteDocument({}, form({ storage_path: 'victim/file' }))).success);
  assert.deepEqual(f.calls.filter(c => ['update', 'remove', 'delete'].includes(c[0])).map(c => c[0]), ['update', 'remove', 'delete']);
  const mark = f.calls.find(c => c[0] === 'update')[2];
  assert.equal(mark.deletion_pending, true); assert.equal(mark.visibility, 'private');
  assert.equal(f.calls.find(c => c[0] === 'remove')[1], `${owner}/${id}`);
  assert.equal(f.row(), null); assert.equal(f.fileExists(), false);
});
test('failed marker never deletes bytes', async () => {
  const f = fixture({ updateError: true }); assert.ok((await f.actions.deleteDocument({}, form())).error);
  assert.equal(f.fileExists(), true); assert.ok(!f.calls.some(c => c[0] === 'remove'));
});
test('storage failure or exception keeps private pending record and retry succeeds', async () => {
  for (const option of ['storageError', 'storageThrow']) {
    const f = fixture({ [option]: true }); assert.ok((await f.actions.deleteDocument({}, form())).error);
    assert.equal(f.row().deletion_pending, true); assert.equal(f.row().visibility, 'private');
    assert.ok(!f.calls.some(c => c[0] === 'delete'));
    assert.ok((await f.actions.editDocument({}, form())).error);
    f.opts[option] = false;
    assert.ok((await f.actions.deleteDocument({}, form())).success); assert.equal(f.row(), null);
  }
});
test('record failure retries safely after file is already gone', async () => {
  const f = fixture({ recordError: true }); assert.ok((await f.actions.deleteDocument({}, form())).error);
  assert.equal(f.fileExists(), false); assert.equal(f.row().deletion_pending, true);
  f.opts.recordError = false;
  assert.ok((await f.actions.deleteDocument({}, form())).success); assert.equal(f.row(), null);
  assert.ok((await f.actions.deleteDocument({}, form())).success);
});
test('already absent record causes no storage operation', async () => {
  const f = fixture({ missing: true }); assert.ok((await f.actions.deleteDocument({}, form())).success);
  assert.ok(!f.calls.some(c => c[0] === 'remove'));
});
