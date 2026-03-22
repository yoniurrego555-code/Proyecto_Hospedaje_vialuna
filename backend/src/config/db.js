// src/config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",        // ✅ mejor usar localhost
    user: "root",
    password: "Yoniurrego200421@",  // 🔐 la que pusiste al instalar
    database: "hospedaje",
    port: 3307,               // ✅ puerto por defecto
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;