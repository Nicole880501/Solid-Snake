function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function fetchHighestScore(username) {
  try {
    const token = getCookie("access_token");
    const response = await fetch("/record/maxScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    document.getElementById(
      "highest-score-title"
    ).innerHTML = `${data.data.name}, Your Highest Score: ${data.data.score}`;
  } catch (error) {
    console.error("Error fetching highest score:", error);
  }
}

async function fetchRanking() {
  try {
    const response = await fetch("/record/ranking");
    const players = await response.json();
    const rankingTable = document.getElementById("ranking_table");
    rankingTable.innerHTML = "";

    players.data.forEach((player) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${player.user_name}</td>
        <td>${player.score}</td>
        <td>${player.skin}</td>
        <td>${player.timestamp}</td>
            `;
      rankingTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetch ranking:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchHighestScore();
  fetchRanking();
});
