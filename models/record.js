const mysql = require('mysql2/promise')
const { format } = require('date-fns')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

exports.createRecord = async (data) => {
  const result = pool.query('INSERT INTO Records SET ?', data)
  return result
}

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
  `

  try {
    const [rows] = await pool.query(query, [userName])
    return rows[0]
  } catch (error) {
    console.error('Error fetching score records:', error)
    throw error
  }
}

exports.getAllPlayerRecord = async () => {
  const query = `
    WITH RankedRecords AS (
      SELECT
        user_name,
        skin,
        score,
        play_time,
        player_kill,
        total_moves,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY score DESC, player_kill DESC, timestamp DESC) as rn
      FROM
      Records
    )
    SELECT
      user_name,
      skin,
      score,
      play_time,
      player_kill,
      total_moves,
      timestamp
    FROM
      RankedRecords
    WHERE
      rn = 1
    ORDER BY
      score DESC, player_kill DESC, timestamp DESC;
  `

  try {
    const [rows] = await pool.query(query)

    const formattedTime = rows.map((row) => ({
      ...row,
      timestamp: format(new Date(row.timestamp), 'yyyy-MM-dd HH:mm:ss')
    }))
    return formattedTime
  } catch (error) {
    console.error('Error fetching highest score:', error)
    throw error
  }
}

exports.getAllScore = async (username) => {
  const query = `
  SELECT user_name,
    SUM(score) AS total_score,
    MAX(score) AS highest_score,
    AVG(score) AS average_score
  FROM
    Records
  WHERE
    user_name = ?
  GROUP BY
    user_name
  `

  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching highest score:', error)
    throw error
  }
}

exports.getAllKill = async (username) => {
  const query = `
  SELECT user_name,
    SUM(player_kill) AS total_kill,
    MAX(player_kill) AS highest_kill,
    AVG(player_kill) AS average_kill
  FROM
    Records
  WHERE
    user_name = ?
  GROUP BY
    user_name
  `

  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching kill records:', error)
    throw error
  }
}

exports.getAllGame = async (username) => {
  const query = `
  SELECT 
    COUNT(user_name) AS total_game
  FROM
    Records
  WHERE
    user_name = ?
  `

  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching game records:', error)
    throw error
  }
}

exports.getAllTime = async (username) => {
  const query = `
  SELECT user_name,
    SUM(play_time) AS total_time,
    MAX(play_time) AS highest_time,
    AVG(play_time) AS average_time
  FROM
    Records
  WHERE
    user_name = ?
  GROUP BY
    user_name
  `

  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching time records:', error)
    throw error
  }
}

exports.getAllMove = async (username) => {
  const query = `
  SELECT user_name,
    SUM(total_moves) AS total_move,
    MAX(total_moves) AS highest_move,
    AVG(total_moves) AS average_move
  FROM
    Records
  WHERE
    user_name = ?
  GROUP BY
    user_name
  `

  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching move records:', error)
    throw error
  }
}

exports.getMostUsedSkin = async (username) => {
  const query = `
SELECT r1.user_name, r1.skin, r1.skin_count
    FROM (
        SELECT user_name, skin, COUNT(skin) AS skin_count
        FROM Records
        GROUP BY user_name, skin
    ) AS r1
    INNER JOIN (
        SELECT user_name, MAX(skin_count) AS max_skin_count
        FROM (
            SELECT user_name, skin, COUNT(skin) AS skin_count
            FROM Records
            GROUP BY user_name, skin
        ) AS subquery
        GROUP BY user_name
    ) AS r2
    ON r1.user_name = r2.user_name AND r1.skin_count = r2.max_skin_count
    WHERE r1.user_name = ?
    LIMIT 1;
  `
  try {
    const [rows] = await pool.query(query, [username])
    return rows[0]
  } catch (error) {
    console.error('Error fetching skin record:', error)
    throw error
  }
}
