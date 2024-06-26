const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

async function generateFakeData () {
  const canvasWidth = 80
  const canvasHeight = 40
  const fixedData = {
    user_name: 'testPlayer',
    skin: 'default',
    score: 100,
    level: 1,
    experience: 100,
    play_time: 10,
    player_kill: 10,
    total_moves: 10
  }

  for (let i = 0; i < 1000; i++) {
    const data = {
      ...fixedData,
      death_x: Math.floor(Math.random() * canvasWidth),
      death_y: Math.floor(Math.random() * canvasHeight)
    }

    try {
      const result = await pool.query('INSERT INTO Records SET ?', data)
      console.log(`Inserted record ${i + 1}:`, result)
    } catch (error) {
      console.error('Error inserting data:', error)
    }
  }

  pool.end()
}

generateFakeData()
