const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

exports.createRecord = async (data) => {
  const result = pool.query("INSERT INTO Records SET ?", data);
  console.log(result);
  return result;
};
