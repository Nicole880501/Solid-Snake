function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

async function fetchPersonalHighestRecord (type) {
  try {
    const token = getCookie('access_token')

    if (!token) {
      document.getElementById('highest-title').innerHTML = 'You Are Not Signin'
    } else {
      if (type === 'score') {
        const response = await fetch('/record/playerScore', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        console.log(data)
        document.getElementById(
          'highest-title'
        ).innerHTML = `${data.user_name}, Your Highest Score: ${data.highest_score}`
      } else if (type === 'level') {
        const response = await fetch('/user/level', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        console.log(data)
        document.getElementById(
          'highest-title'
        ).innerHTML = `${data.name}, Your Level: ${data.level}`
      } else if (type === 'kill') {
        const response = await fetch('/record/playerKill', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        document.getElementById(
          'highest-title'
        ).innerHTML = `${data.user_name}, Your Highest Kill: ${data.highest_kill}`
      } else if (type === 'time') {
        const response = await fetch('/record/playerTime', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        document.getElementById(
          'highest-title'
        ).innerHTML = `${data.user_name}, Your Highest Playtime: ${data.highest_time}'s`
      } else if (type === 'moves') {
        const response = await fetch('/record/playerMove', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        document.getElementById(
          'highest-title'
        ).innerHTML = `${data.user_name}, Your Highest Moves: ${data.highest_move} steps`
      }
    }
  } catch (error) {
    console.error('Error fetching highest score:', error)
  }
}

async function fetchRanking (type) {
  try {
    let url = ''
    if (type === 'score') {
      url = '/record/scoreRanking'
    } else if (type === 'level') {
      url = '/record/levelRanking'
    } else if (type === 'kill') {
      url = '/record/killRanking'
    } else if (type === 'time') {
      url = '/record/timeRanking'
    } else if (type === 'moves') {
      url = '/record/moveRanking'
    }
    const response = await fetch(url)
    const players = await response.json()
    const rankingTable = document.getElementById('ranking_table')
    rankingTable.innerHTML = ''

    for (let i = 0; i < players.data.length; i++) {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${players.data[i].user_name}</td>
        <td>${players.data[i].level}</td>
        <td>${players.data[i].score}</td>
        <td>${players.data[i].player_kill}</td>
        <td>${players.data[i].skin}</td>
        <td>${players.data[i].play_time}'s</td>
        <td>${players.data[i].total_moves} steps</td>
        <td>${players.data[i].timestamp}</td>
            `
      rankingTable.appendChild(row)

      fetchPersonalHighestRecord(type)
    }
  } catch (error) {
    console.error('Error fetch ranking:', error)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPersonalHighestRecord('score')
  fetchRanking('score')
})
