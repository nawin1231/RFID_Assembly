const { test } = require('node:test');
const assert = require('node:assert');
const { inferSqlType, typed, sql } = require('../../db');

test('inferSqlType maps JS values to mssql types', () => {
    assert.strictEqual(inferSqlType(5).name, 'Int');
    assert.strictEqual(inferSqlType('abc').name, 'VarChar');
    assert.strictEqual(inferSqlType(new Date()).name, 'DateTime');
    assert.strictEqual(inferSqlType(null).name, 'VarChar');
});

test('typed() forces a specific type', () => {
    assert.strictEqual(inferSqlType(typed(sql.Date, '2026-09-03')).name, 'Date');
});
