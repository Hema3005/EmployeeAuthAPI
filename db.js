const { Pool } = require("pg");
require("dotenv").config();

console.log("DB_USER:", process.env.DB_USER);
const pool = new Pool({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  port: 5432,
});



module.exports = pool;
