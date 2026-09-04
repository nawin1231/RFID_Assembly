const { test } = require('node:test');
const assert = require('node:assert');
const { createFakeDb } = require('../helpers/fakeDb');
const {
    listStatuses, createStatus, updateStatus, deleteStatus,
} = require('../../services/masterService');

test('listStatuses joins the process master', async () => {
    const db = createFakeDb([{ recordset: [{ id: 1, status: 'bf_issue', process_code: '1400' }] }]);
    const rows = await listStatuses(db);
    assert.strictEqual(rows[0].process_code, '1400');
    assert.match(db.calls[0].sql, /LEFT JOIN tb_master_process/);
});

test('createStatus returns OK', async () => {
    const db = createFakeDb([{ rowsAffected: [1] }]);
    assert.deepStrictEqual(
        await createStatus(db, { status: 's', label_status: 'S', process_id: 1 }),
        { result: 'OK' });
});

test('createStatus returns the error message as result, not a throw', async () => {
    const db = { query: async () => { throw new Error('FK violation'); } };
    assert.deepStrictEqual(
        await createStatus(db, { status: 's', label_status: 'S', process_id: 99 }),
        { result: 'FK violation' });
});

test('updateStatus passes a null process_id through', async () => {
    const db = createFakeDb([{ rowsAffected: [1] }]);
    await updateStatus(db, { id: 1, status: 's', label_status: 'S', process_id: null });
    assert.strictEqual(db.calls[0].params.process_id, null);
});

test('deleteStatus returns OK', async () => {
    const db = createFakeDb([{ rowsAffected: [1] }]);
    assert.deepStrictEqual(await deleteStatus(db, 1), { result: 'OK' });
});
