function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const button = window.document.querySelector('.btn')

button.addEventListener('click', () => {
  const token = getCookie('access_token')

  if (token) {
    window.location.href = '/game'
  } else {
    window.location.href = '/signin'
  }
})
