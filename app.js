// Define the rounds
const rounds = ["2T", "1E1T", "2E", "1E2T", "2E1T", "3E", "4T", "ER"];

// Initialize variables
let players = [];
let scores = {}; // { playerName: [score1, score2, ...] }
let currentRoundIndex = 0;

// DOMContentLoaded event to ensure the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  const playerNamesInputs = document.getElementById("player-names-inputs");
  const addPlayerButton = document.getElementById("add-player-button");
  const startGameButton = document.getElementById("start-game-button");
  const resetGameButton = document.getElementById("reset-game-button");

  // Function to add a player input field
  function addPlayerInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Player Name";
    playerNamesInputs.appendChild(input);
  }

  // Add initial two player input fields
  addPlayerInput();
  addPlayerInput();

  // Add more player input fields
  addPlayerButton.addEventListener("click", function() {
    addPlayerInput();
  });

  // Start the game
  startGameButton.addEventListener("click", function() {
    const inputs = playerNamesInputs.getElementsByTagName("input");
    players = [];
    for (let input of inputs) {
      if (input.value.trim() !== "") {
        players.push(input.value.trim());
        scores[input.value.trim()] = [];
      }
    }
    if (players.length >= 2) {
      document.getElementById("player-names-section").classList.add("hidden");
      saveGameState();
      startRound();
    } else {
      alert("Please enter at least two player names.");
    }
  });

  // Reset the game
  resetGameButton.addEventListener("click", function() {
    localStorage.removeItem('cariocaGameState');
    location.reload();
  });

  // Load game state if available
  if (loadGameState()) {
    document.getElementById("player-names-section").classList.add("hidden");
    if (currentRoundIndex >= rounds.length) {
      showFinalResults();
    } else {
      startRound();
    }
  }
});

// Function to start a round
function startRound() {
  if (currentRoundIndex >= rounds.length) {
    showFinalResults();
    return;
  }

  const scoreEntrySection = document.getElementById("score-entry-section");
  const roundTitle = document.getElementById("round-title");
  const scoreInputs = document.getElementById("score-inputs");
  const submitScoresButton = document.getElementById("submit-scores-button");

  // Update round title
  roundTitle.textContent = "Round: " + rounds[currentRoundIndex];

  // Clear previous inputs
  scoreInputs.innerHTML = "";

  // Create input fields for each player
  players.forEach(function(player) {
    const div = document.createElement("div");
    div.textContent = player + ": ";
    const input = document.createElement("input");
    input.type = "number";
    input.dataset.player = player;
    div.appendChild(input);
    scoreInputs.appendChild(div);
  });

  // Show the score entry section
  scoreEntrySection.classList.remove("hidden");

  // Submit scores for the round
  submitScoresButton.onclick = function() {
    const inputs = scoreInputs.getElementsByTagName("input");
    let allScoresEntered = true;
    for (let input of inputs) {
      let score = parseInt(input.value, 10);
      if (isNaN(score)) {
        allScoresEntered = false;
        break;
      }
    }
    if (!allScoresEntered) {
      alert("Please enter scores for all players.");
      return;
    }

    // Save scores
    for (let input of inputs) {
      let score = parseInt(input.value, 10);
      let player = input.dataset.player;
      scores[player].push(score);
    }

    // Save game state
    saveGameState();

    // Hide score entry section
    scoreEntrySection.classList.add("hidden");

    // Show scoreboard
    updateScoreboard();
  };
}

// Function to update the scoreboard
function updateScoreboard() {
  const scoreboardSection = document.getElementById("scoreboard-section");
  const scoreboardTable = document.getElementById("scoreboard-table");
  const nextRoundButton = document.getElementById("next-round-button");

  // Clear previous scoreboard
  scoreboardTable.innerHTML = "";

  // Create table header
  const headerRow = document.createElement("tr");
  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Player";
  headerRow.appendChild(nameHeader);

  const totalHeader = document.createElement("th");
  totalHeader.textContent = "Total";
  headerRow.appendChild(totalHeader);

  scoreboardTable.appendChild(headerRow);

  // Create table rows for each player
  players.forEach(function(player) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = player;
    row.appendChild(nameCell);

    const totalScore = scores[player].reduce((a, b) => a + b, 0);
    const totalCell = document.createElement("td");
    totalCell.textContent = totalScore;
    row.appendChild(totalCell);

    scoreboardTable.appendChild(row);
  });

  // Show scoreboard section
  scoreboardSection.classList.remove("hidden");

  if (currentRoundIndex < rounds.length - 1) {
    nextRoundButton.classList.remove("hidden");
    nextRoundButton.onclick = function() {
      currentRoundIndex++;
      scoreboardSection.classList.add("hidden");
      saveGameState();
      startRound();
    };
  } else {
    nextRoundButton.classList.add("hidden");
    showFinalResults();
  }
}

// Function to show final results
function showFinalResults() {
  const finalResultsDiv = document.getElementById("final-results");
  const winnerAnnouncement = document.getElementById("winner-announcement");

  // Calculate total scores
  const totalScores = players.map(function(player) {
    return {
      player: player,
      total: scores[player].reduce((a, b) => a + b, 0)
    };
  });

  // Find the player(s) with the least total points
  totalScores.sort(function(a, b) {
    return a.total - b.total;
  });

  const lowestScore = totalScores[0].total;
  const winners = totalScores.filter(function(score) {
    return score.total === lowestScore;
  });

  if (winners.length === 1) {
    winnerAnnouncement.textContent = "Winner: " + winners[0].player + " with " + winners[0].total + " points!";
  } else {
    const winnerNames = winners.map(function(w) { return w.player; }).join(", ");
    winnerAnnouncement.textContent = "It's a tie between: " + winnerNames + " with " + winners[0].total + " points!";
  }

  finalResultsDiv.classList.remove("hidden");
}

// Function to save the game state to local storage
function saveGameState() {
  const gameState = {
    players: players,
    scores: scores,
    currentRoundIndex: currentRoundIndex
  };
  localStorage.setItem('cariocaGameState', JSON.stringify(gameState));
}

// Function to load the game state from local storage
function loadGameState() {
  const savedState = localStorage.getItem('cariocaGameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    players = gameState.players;
    scores = gameState.scores;
    currentRoundIndex = gameState.currentRoundIndex;
    return true;
  }
  return false;
}