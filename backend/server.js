require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

//*need to can handle 30+ reader node points in the future

const assemblyRoutes = require('./routes/assembly');
app.use('/api/assembly', assemblyRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const startPolling = async () => {
    const { sql, poolPromise } = require('./database');
    let isPolling = false;

    const poll = async () => {
        if (isPolling) return;
        isPolling = true;
        try {
            const pool = await poolPromise;
            const doneList = await pool.request()
                .query(`SELECT lot_no FROM tb_assy_mock_done`);

            for (const row of doneList.recordset) {
                const check = await pool.request()
                    .input('lot_no', sql.VarChar, row.lot_no)
                    .query(`SELECT lot_no, tag_id FROM tb_assy_lot 
                            WHERE lot_no = @lot_no AND status_id != '4'`);

                if (check.recordset.length === 0) continue;

                await pool.request()
                    .input('lot_no', sql.VarChar, row.lot_no)
                    .query(`UPDATE tb_assy_lot SET status_id = '4', updated_at = GETDATE() WHERE lot_no = @lot_no`);

                await pool.request()
                    .input('lot_no', sql.VarChar, row.lot_no)
                    .query(`UPDATE tb_assy_tag SET status = 'cleared', cleared_at = GETDATE() WHERE lot_no = @lot_no AND status = 'active'`);

                await pool.request()
                    .input('lot_no', sql.VarChar, row.lot_no)
                    .input('tag_id', sql.VarChar, check.recordset[0].tag_id)
                    .query(`INSERT INTO tb_assy_log (lot_no, tag_id, event_type, remark)
                            VALUES (@lot_no, @tag_id, 'COMPLETED', 'Tag cleared by polling')`);

                console.log(`[Polling] Cleared tag for lot: ${row.lot_no}`);
            }
        } catch (err) {
            console.error('[Polling] Error:', err.message);
        } finally {
            isPolling = false;
        }
    };

    setTimeout(() => {
        poll();
        setInterval(poll, 30 * 1000);
    }, 30 * 1000);
};
startPolling();

// require('dotenv').config();
// const express = require('express');
// const cors    = require('cors');
// const axios   = require('axios');
// const app     = express();

// app.use(cors());
// app.use(express.json());

// const assemblyRoutes = require('./routes/assembly');
// app.use('/api/assembly', assemblyRoutes);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // ================================================================
// // POLLING — ตรวจสอบ lot ที่ done จาก AS400
// // ================================================================

// const startPolling = async () => {
//     const { sql, poolPromise } = require('./database');
//     const API_TOKEN           = process.env.API_TOKEN;
//     const API_PROD_RESULT_URL = process.env.API_PROD_RESULT_URL;

//     let isPolling = false;

//     const poll = async () => {
//         if (isPolling) return;
//         isPolling = true;
//         try {
//             const pool = await poolPromise;

//             // ดึง lot ที่ยังไม่ completed (status_id 1,2,3)
//             const pending = await pool.request()
//                 .query(`SELECT lot_no, tag_id FROM tb_assy_lot WHERE status_id != 4`);

//             for (const row of pending.recordset) {
//                 try {
//                     // ยิง API AS400 ถามว่า lot นี้ done ไหม
//                     const res = await axios.get(
//                         `${API_PROD_RESULT_URL}/${row.lot_no}`,
//                         { headers: { Authorization: API_TOKEN }, timeout: 5000 }
//                     );

//                     const data = res.data?.[0];

//                     // ถ้าไม่มีข้อมูลหรือ data not found → ข้ามไป
//                     if (!data) continue;

//                     // มีข้อมูล → clear tag ผ่าน SP
//                     const result = await pool.request()
//                         .input('lot_no', sql.VarChar, row.lot_no)
//                         .execute('Stored_tb_assy_completed');

//                     const spResult = result.recordset[0]?.result;
//                     if (spResult === 'OK') {
//                         console.log(`[Polling] Cleared: ${row.lot_no}`);
//                     } else {
//                         console.warn(`[Polling] SP result: ${spResult} — lot: ${row.lot_no}`);
//                     }

//                 } catch (err) {
//                     // 404 หรือ "data not found" → ปกติ ข้ามไป
//                     if (err.response?.status_id === 404) continue;
//                     console.error(`[Polling] lot ${row.lot_no}: ${err.message}`);
//                 }
//             }

//         } catch (err) {
//             console.error('[Polling] Error:', err.message);
//         } finally {
//             isPolling = false;
//         }
//     };

//     // รอ 30 วิหลัง server start แล้วค่อย poll ทุก 30 วิ
//     setTimeout(() => {
//         poll();
//         setInterval(poll, 30 * 1000);
//     }, 30 * 1000);
// };

// startPolling();