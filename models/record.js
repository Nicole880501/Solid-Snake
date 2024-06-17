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
  return result;
};

exports.getPersonalRecord = async (userName) => {
  const query = `
    SELECT 
        r1.user_name,
        r1.skin,
        r1.score,
        r1.timestamp
    FROM 
        Records r1
    INNER JOIN (
        SELECT 
            user_name,
            MAX(score) as max_score
        FROM 
            Records
        WHERE 
            user_name = ?
        GROUP BY 
            user_name
    ) r2 ON r1.user_name = r2.user_name AND r1.score = r2.max_score;
  `;

  try {
    const [rows] = await pool.query(query, [userName]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching highest score:", error);
    throw error;
  }
};

exports.getAllPlayerRecord = async () => {
  const query = `
  SELECT 
      r1.user_name,
      r1.skin,
      r1.score,
      r1.timestamp
  FROM 
      Records r1
  INNER JOIN (
      SELECT 
          user_name,
          MAX(score) as max_score
      FROM 
          Records
      GROUP BY 
          user_name
  ) r2 ON r1.user_name = r2.user_name AND r1.score = r2.max_score;
`;

  try {
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching highest score:", error);
    throw error;
  }
};
