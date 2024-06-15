document
  .getElementById("signupForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const playerName = document.getElementById("playerName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playerName,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        alert("Registration successful! Redirecting to login page...");
        window.location.href = "./signin.html";
        // You can handle the success case here, such as redirecting the user
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while signup in.");
    }
  });
