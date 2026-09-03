const sql = require('mssql');

const dbConfig = {
    server: process.env.DB_SERVER || 'PBSY70\\SQLEXPRESS',
    port: process.env.DB_PORT || 1433,
    database: process.env.DB_NAME || 'db_rfid_assembly',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        //console.log('Connected database successfully!');
        return pool;
    })
    .catch(err => {
        console.error('Connection error:', err);
    });

module.exports = { sql, poolPromise };