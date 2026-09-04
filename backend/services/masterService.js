// Interim: the SPs returned SQL errors as a `result` string and the frontend
// depends on it. Task 10 replaces this with typed errors and HTTP codes.
const asResult = async (fn) => {
    try {
        await fn();
        return { result: 'OK' };
    } catch (err) {
        return { result: err.message };
    }
};

const listStatuses = async (db) => {
    const out = await db.query(`
        SELECT s.id, s.status, s.label_status, s.process_id, p.process_code, p.process_name
        FROM tb_master_assy_status s
        LEFT JOIN tb_master_process p ON p.id = s.process_id`);
    return out.recordset;
};

const createStatus = (db, { status, label_status, process_id }) =>
    asResult(() => db.query(
        `INSERT INTO tb_master_assy_status (status, label_status, process_id)
         VALUES (@status, @label_status, @process_id)`,
        { status, label_status, process_id: process_id ?? null }));

const updateStatus = (db, { id, status, label_status, process_id }) =>
    asResult(() => db.query(
        `UPDATE tb_master_assy_status
         SET status = @status, label_status = @label_status, process_id = @process_id
         WHERE id = @id`,
        { id, status, label_status, process_id: process_id ?? null }));

const deleteStatus = (db, id) =>
    asResult(() => db.query(`DELETE FROM tb_master_assy_status WHERE id = @id`, { id }));

module.exports = { asResult, listStatuses, createStatus, updateStatus, deleteStatus };
