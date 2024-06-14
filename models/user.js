const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

exports.createUser = async (data) => {
  const [result] = await pool.query("INSERT INTO Users SET ?", data);
  return result;
};

exports.getUser = async (name) => {
  const [result] = await pool.query("SELECT * FROM Users WHERE name = ?", name);
  return result[0];
};

exports.getUserByEmail = async (email) => {
  const [result] = await pool.query(
    "SELECT * FROM Users WHERE email = ?",
    email
  );
};
