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
      updateScoreboard(); // Show the scoreboard
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
    updateScoreboard(); // Update the scoreboard
    if (currentRoundIndex >= rounds.length) {
      // All rounds have been played
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
  const dealerInfo = document.getElementById("dealer-info");

  // Update round title
  roundTitle.textContent = "Enter Scores for Round: " + rounds[currentRoundIndex];

  // Calculate the dealer for this round
  const dealerIndex = currentRoundIndex % players.length;
  const dealerName = players[dealerIndex];

  // Display dealer information
  dealerInfo.textContent = "Dealer for this round: " + dealerName;

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

    // Update scoreboard
    currentRoundIndex++;
    updateScoreboard();

    // Proceed to next round if any
    if (currentRoundIndex < rounds.length) {
      startRound();
    } else {
      showFinalResults();
    }
  };
}

// Function to update the scoreboard
function updateScoreboard() {
  const scoreboardTable = document.getElementById("scoreboard-table");

  // Clear previous scoreboard
  scoreboardTable.innerHTML = "";

  // Create table header
  const headerRow = document.createElement("tr");
  const roundHeader = document.createElement("th");
  roundHeader.textContent = "Round";
  headerRow.appendChild(roundHeader);

  players.forEach(function(player) {
    const playerHeader = document.createElement("th");
    playerHeader.textContent = player;
    headerRow.appendChild(playerHeader);
  });

  // Add a column for Dealer
  const dealerHeader = document.createElement("th");
  dealerHeader.textContent = "Dealer";
  headerRow.appendChild(dealerHeader);

  scoreboardTable.appendChild(headerRow);

  // Now, create rows for each round
  for (let i = 0; i < rounds.length; i++) {
    const row = document.createElement("tr");
    const roundCell = document.createElement("td");
    roundCell.textContent = rounds[i];
    row.appendChild(roundCell);

    // For each player
    players.forEach(function(player) {
      const cell = document.createElement("td");

      if (scores[player].length > i) {
        // The player has a score for this round
        const score = scores[player][i];
        // Calculate cumulative total up to this round
        const cumulativeTotal = scores[player].slice(0, i + 1).reduce((a, b) => a + b, 0);
        cell.textContent = score + " / " + cumulativeTotal;
      } else {
        // Round not yet played
        cell.textContent = "-";
      }

      row.appendChild(cell);
    });

    // Determine the dealer for this round
    const dealerIndex = i % players.length;
    const dealerName = players[dealerIndex];

    const dealerCell = document.createElement("td");
    dealerCell.textContent = dealerName;
    row.appendChild(dealerCell);

    scoreboardTable.appendChild(row);
  }

  // Show scoreboard section
  const scoreboardSection = document.getElementById("scoreboard-section");
  scoreboardSection.classList.remove("hidden");
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