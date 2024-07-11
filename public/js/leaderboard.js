function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

// eslint-disable-next-line no-unused-vars
function signout () {
  document.cookie = 'access_token=; Max-Age=0; path=/'

  window.location.href = '/'
}

function updateHighestTitle (text) {
  const highestTitle = document.getElementById('highest-title')
  highestTitle.style.opacity = 0
  setTimeout(() => {
    highestTitle.innerText = text
    highestTitle.style.opacity = 1
  }, 300)
}

async function fetchPersonalHighestRecord (type) {
  try {
    const token = getCookie('access_token')

    if (!token) {
      document.getElementById('sign-in-link').style.display = 'inline'
      document.getElementById('sign-out-link').style.display = 'none'
      document.getElementById('analytics-link').style.display = 'none'
      updateHighestTitle('You Are Not Signed In')
    } else {
      document.getElementById('sign-in-link').style.display = 'none'
      document.getElementById('sign-out-link').style.display = 'inline'
      document.getElementById('analytics-link').style.display = 'inline'

      let response, data
      if (type === 'score') {
        response = await fetch('/record/playerScore', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        data = await response.json()
        updateHighestTitle(`${data.user_name}, Your Highest Score: ${data.highest_score}`)
      } else if (type === 'level') {
        response = await fetch('/user/level', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        data = await response.json()
        updateHighestTitle(`${data.name}, Your Level: ${data.level}`)
      } else if (type === 'kill') {
        response = await fetch('/record/playerKill', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        data = await response.json()
        updateHighestTitle(`${data.user_name}, Your Highest Kill: ${data.highest_kill}`)
      } else if (type === 'time') {
        response = await fetch('/record/playerTime', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        data = await response.json()
        updateHighestTitle(`${data.user_name}, Your Highest Playtime: ${data.highest_time}`)
      } else if (type === 'moves') {
        response = await fetch('/record/playerMove', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        data = await response.json()
        updateHighestTitle(`${data.user_name}, Your Highest Moves: ${data.highest_move} steps`)
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
    }

    fetchPersonalHighestRecord(type)
  } catch (error) {
    console.error('Error fetching ranking:', error)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPersonalHighestRecord('score')
  fetchRanking('score')
})
