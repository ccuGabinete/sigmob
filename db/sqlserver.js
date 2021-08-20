const sql = require('mssql');
require('dotenv').config()
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    trustServerCertificate: true,
    enableArithAbort: true,
    port: 1433
};


module.exports = {
    sql: sql,
    config: config
};