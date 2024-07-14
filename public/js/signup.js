document
  .getElementById('signupForm')
  .addEventListener('submit', async function (event) {
    event.preventDefault()
    const playerName = document.getElementById('playerName').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    if (playerName.length < 3) {
      showAlert('Player name must be at least 3 characters long', 'danger')
      return
    }

    if (email.length < 6) {
      showAlert('Email must be at least 6 character long', 'danger')
      return
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 character long', 'danger')
      return
    }

    try {
      const response = await fetch('/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playerName,
          email,
          password
        })
      })

      if (response.ok) {
        showAlert("Registration successful! Redirecting to login page 3's later...", 'success')
        setTimeout(() => {
          window.location.href = '/game'
        }, 3000)
      } else {
        const errorData = await response.json()
        showAlert(`Error: ${errorData.error}`, 'danger')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('An error occurred while signup in.', 'danger')
    }
  })

function showAlert (message, type) {
  const alertContainer = document.getElementById('alert-container')
  const alert = document.createElement('div')
  alert.className = `alert alert-${type} alert-dismissible fade show`
  alert.role = 'alert'
  alert.innerHTML = `
          ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      `
  alertContainer.appendChild(alert)
}
