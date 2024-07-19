document
  .getElementById('loginForm')
  .addEventListener('submit', async function (event) {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const alertContainer = document.getElementById('alert-container')

    alertContainer.innerHTML = ''

    try {
      const response = await fetch('/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        showAlert("Login Successful ! Redirect to game page 3's later...", 'success')
        setTimeout(() => {
          window.location.href = '/game'
        }, 3000)
      } else {
        const errorData = await response.json()
        showAlert(`Error: ${errorData.error}`, 'danger')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('An error occurred while logging in.', 'danger')
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
