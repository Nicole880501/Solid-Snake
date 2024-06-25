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

function getColorByDeathRate (deathRate, maxDeathRate) {
  const hue = (1 - deathRate / maxDeathRate) * 240
  return `hsl(${hue}, 100%, 50%)`
}

async function fetchDeathRates () {
  try {
    const token = getCookie('access_token')
    const response = await fetch('/record/deathZone', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()

    const canvas = document.getElementById('deathRatesCanvas')
    const ctx = canvas.getContext('2d')
    const scale = 20 // 假设每个区域大小为20x20

    const maxDeathRate = Math.max(...data.map(d => d.death_count))

    const deathCounts = {}

    // eslint-disable-next-line camelcase
    data.forEach(({ region_x, region_y, death_count }) => {
      // eslint-disable-next-line camelcase
      const x = region_x * scale
      // eslint-disable-next-line camelcase
      const y = region_y * scale
      ctx.fillStyle = getColorByDeathRate(death_count, maxDeathRate)
      ctx.fillRect(x, y, scale, scale)
      // eslint-disable-next-line camelcase
      deathCounts[`${region_x},${region_y}`] = death_count
    })

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.floor((event.clientX - rect.left) / scale)
      const y = Math.floor((event.clientY - rect.top) / scale)
      const deathCount = deathCounts[`${x},${y}`] || 0
      showTooltip(event.clientX, event.clientY, `Deaths: ${deathCount}`)
    })

    canvas.addEventListener('mouseout', () => {
      hideTooltip()
    })
  } catch (error) {
    console.error('Error fetching death rates:', error)
  }
}

function showTooltip (x, y, text) {
  const tooltip = document.getElementById('tooltip')
  tooltip.style.left = `${x + 10}px`
  tooltip.style.top = `${y + 10}px`
  tooltip.innerHTML = text
  tooltip.style.display = 'block'
}

function hideTooltip () {
  const tooltip = document.getElementById('tooltip')
  tooltip.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', () => {
  const token = getCookie('access_token')
  if (!token) {
    window.location.href = '/signin'
  }
  fetchDeathRates()
})
