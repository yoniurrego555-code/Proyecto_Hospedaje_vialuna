// src/config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "hospedaje",
    port: 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;