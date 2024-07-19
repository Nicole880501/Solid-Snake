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

async function fetchTotalScore () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerScore', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('total_score').innerHTML = `
        <h2>Total Score</h2>
        <p class="stat-value">${data.total_score}</p>
        <p>Highest Score: ${data.highest_score}</p>
        <p>Avg Score: ${data.average_score}</p>
  `
  } catch (error) {
    console.error('Error fetching score: error', error)
  }
}

async function fetchTotalKill () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerKill', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('total_kill').innerHTML = `
        <h2>Total Kill</h2>
        <p class="stat-value">${data.total_kill}</p>
        <p>Max Kill: ${data.highest_kill}</p>
        <p>K/D: ${data.average_kill}</p>
    `
  } catch (error) {
    console.error('Error fetching kill: error', error)
  }
}

async function fetchTotalGame () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerGame', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('total_game').innerHTML = `
        <h2>Total Games</h2>
        <h3 class="stat-value">${data.total_game}</h3>
      `
  } catch (error) {
    console.error('Error fetching game: error', error)
  }
}

async function fetchTotalTime () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerTime', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('total_time').innerHTML = `
        <h2>Total Playtime</h2>
        <h3 class="stat-value">${data.total_time}'s</h3>
        <p>Max Playtime: ${data.highest_time}'s</p>
        <p>Avg Playtime: ${data.average_time}'s</p>
        `
  } catch (error) {
    console.error('Error fetching time: error', error)
  }
}

async function fetchTotalMove () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerMove', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('total_move').innerHTML = `
        <h2>Total Distance</h2>
        <h3 class="stat-value">${data.total_move}</h3>
        <p>Max Distance: ${data.highest_move}</p>
        <p>Avg Distance: ${data.average_move}</p>
          `
  } catch (error) {
    console.error('Error fetching move: error', error)
  }
}

async function fetchMostUsedSkin () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/playerSkin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    document.getElementById('fav_skin').innerHTML = `
        <h2>Most Used Skin</h2>
        <h3 class="stat-value">${data.skin}</h3>
        <h4 class="stat-value">Play: ${data.skin_count} Times</h4>
            `
  } catch (error) {
    console.error('Error fetching skin: error', error)
  }
}

function calculateTotalExperience (level) {
  let totalExperience = 0
  for (let i = 1; i < level; i++) {
    totalExperience += 300 + (i - 1) * 200
  }
  return totalExperience
}

async function fetchPlayerLevel () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/user/level', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()

    const currentLevel = data.level
    const experience = data.experience
    const nextLevel = currentLevel + 1
    const totalCurrentLevelExperience = calculateTotalExperience(currentLevel)
    const totalNextLevelExperience = calculateTotalExperience(nextLevel)
    const requiredExperience = totalNextLevelExperience - totalCurrentLevelExperience
    const progressPercentage = ((experience - totalCurrentLevelExperience) / requiredExperience) * 100

    document.querySelector('.current-level').textContent = currentLevel
    document.querySelector('.next-level').textContent = nextLevel
    document.querySelector('.progress-bar').style.width = `${progressPercentage}%`
    document.querySelector('.progress-bar').textContent = `${Math.round(progressPercentage)}%`
    document.querySelector('.experience').textContent = `${experience}/${totalNextLevelExperience}`
  } catch (error) {
    console.error('Error fetching player level:', error)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = getCookie('access_token')
  if (!token) {
    window.location.href = '/signin'
  }
  fetchTotalScore()
  fetchTotalKill()
  fetchTotalGame()
  fetchTotalTime()
  fetchTotalMove()
  fetchMostUsedSkin()
  fetchPlayerLevel()
})
