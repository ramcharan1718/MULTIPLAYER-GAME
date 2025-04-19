console.log("client.js is executing");  
const socket = io(); 
let roomUniqueId = null; 
let player1 = false;  



function createGame() {     
    player1 = true;     
    socket.emit('createGame');     
    document.getElementById('startGameButton').style.display = 'none'; 
}  

function joinGame() {     
    roomUniqueId = document.getElementById('roomUniqueId').value;     
    socket.emit('joinGame', { roomUniqueId: roomUniqueId });     
    document.getElementById('startGameButton').style.display = 'none'; 
}  

socket.on("newGame", (data) => {     
    roomUniqueId = data.roomUniqueId;     
    document.getElementById('initial').style.display = 'none';     
    document.getElementById('gamePlay').style.display = 'block';     
    let copyButton = document.createElement('button');     
    copyButton.style.display = 'block';     
    copyButton.classList.add('btn', 'btn-primary', 'py-2', 'my-2');     
    copyButton.innerText = 'Copy Code';     
    copyButton.addEventListener('click', () => {         
        navigator.clipboard.writeText(roomUniqueId).then(function () {             
            console.log('Async: Copying to clipboard was successful!');         
        }, function (err) {             
            console.error('Async: Could not copy text: ', err);         
        });     
    });     
    document.getElementById('waitingArea').innerHTML = `Waiting for opponent, please share code <span style="color: white;">${roomUniqueId}</span> to join`;     
    document.getElementById('waitingArea').appendChild(copyButton);     
    document.getElementById('waitingArea').style.color = 'white'; 
});  

socket.on("playersConnected", () => {     
    document.getElementById('initial').style.display = 'none';     
    document.getElementById('waitingArea').style.display = 'none';     
    document.getElementById('gameArea').style.display = 'flex'; 
});  

socket.on("p1Choice", (data) => {     
    if (!player1) {         
        createOpponentChoiceButton(data);     
    } 
});  

socket.on("p2Choice", (data) => {     
    if (player1) {         
        createOpponentChoiceButton(data);     
    } 
});  

socket.on("result", (data) => {     
    let winnerText = '';     
    if (data.winner != 'd') {         
        if (data.winner == 'p1' && player1) {             
            winnerText = '<span style="color: white;">You win</span>';         
        } else if (data.winner == 'p1') {             
            winnerText = '<span style="color: white;">You lose</span>';         
        } else if (data.winner == 'p2' && !player1) {             
            winnerText = '<span style="color: white;">You win</span>';         
        } else if (data.winner == 'p2') {             
            winnerText = '<span style="color: white;">You lose</span>';         
        }     
    } else {         
        winnerText = `<span style="color: white;">It's a draw</span>`;     
    }     
    document.getElementById('opponentState').style.display = 'none';     
    document.getElementById('opponentButton').style.display = 'block';     
    document.getElementById('winnerArea').innerHTML = winnerText; 
});  

function sendChoice(rpsValue) {     
    const choiceEvent = player1 ? "p1Choice" : "p2Choice";     
    socket.emit(choiceEvent, {         
        rpsValue: rpsValue,         
        roomUniqueId: roomUniqueId     
    });     
    let playerChoiceButton = document.createElement('button');     
    playerChoiceButton.style.display = 'block';     
    playerChoiceButton.style.color = 'white'; 
    playerChoiceButton.classList.add(rpsValue.toString().toLowerCase());     
    playerChoiceButton.innerText = rpsValue;     
    document.getElementById('player1Choice').innerHTML = "";     
    document.getElementById('player1Choice').appendChild(playerChoiceButton); 
}  

function createOpponentChoiceButton(data) {     
    document.getElementById('opponentState').innerHTML = "<span style='color: white;'>Opponent made a choice</span>";     
    let opponentButton = document.createElement('button');     
    opponentButton.id = 'opponentButton';     
    opponentButton.classList.add(data.rpsValue.toString().toLowerCase());     
    opponentButton.style.display = 'none';     
    opponentButton.style.color = 'white'; // Ensure opponent button text is white
    opponentButton.innerText = data.rpsValue;     
    document.getElementById('player2Choice').appendChild(opponentButton); 
}  



let userScore = 0;
let computerScore = 0;
let totalRounds = 0;         
let currentRound = 0;
let roundTimer;
let timeLeft = 5;
let isPaused = false;
const hands = ["<img src='assets/rock.png'>", "<img src='assets/paper.png'>", "<img src='assets/scissor.png'>"];
const buttonSound = new Audio('assets/audio.mp3');
const backgroundMusic = new Audio('assets/ausio2.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
let isMusicOn = true;

function randomfromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function playSound() {
    buttonSound.play();
}

function toggleMusic() {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function askRounds() {
    console.log("askRounds function called"); 
    playSound();
    document.getElementById("roundsModal").style.display = "inline-block"; 
}

function startGame() {
    console.log("startGame function called"); 
    const roundsInput = document.getElementById("roundsInput").value;
    const rounds = parseInt(roundsInput);

    if (isNaN(rounds) || rounds <= 0) {
        alert("Please enter a valid number of rounds (greater than 0).");
        return;
    }

    totalRounds = rounds;
    currentRound = 0;
    userScore = 0;
    computerScore = 0;
    isPaused = false;

    document.getElementById("roundsModal").style.display = "none"; 
    document.getElementById("startGameButton").style.display = "none"; 

    const createButton = document.getElementById('createGameButton');
    if (createButton) createButton.style.display = 'none';

    const joinButton = document.getElementById('joinGameButton');
    if (joinButton) joinButton.style.display = 'none';

    const orButton = document.getElementById('or');
    if (orButton) orButton.style.display = 'none';

    const roomButton = document.getElementById('roomUniqueId');
    if (roomButton) roomButton.style.display = 'none';

    const rockButton = document.getElementById('rockp');
    if (rockButton) rockButton.style.display = 'none';

    const paperButton = document.getElementById('paperp');
    if (paperButton) paperButton.style.display = 'none';

    const scissorButton = document.getElementById('scissorp');
    if (scissorButton) scissorButton.style.display = 'none';

    document.querySelector(".game-container").classList.remove("hidden");
    document.querySelector(".buttons").classList.remove("hidden");
    document.getElementById("scoreboard").classList.remove("hidden");
    document.getElementById("pause").classList.remove("hidden");
    document.getElementById("settings").classList.remove("hidden");
    document.getElementById("timerDisplay").classList.remove("hidden");

    document.getElementById("pause").style.display = "inline-block";
    document.getElementById("pause").innerText = "Pause";
    document.getElementById("scoreboard").innerText = `Score: ${userScore} - ${computerScore}`;
    document.getElementById("rock").style.display = "inline-block";
    document.getElementById("paper").style.display = "inline-block";
    document.getElementById("scissors").style.display = "inline-block";
    document.getElementById("pause").style.display = "flex";
    document.getElementById("timerDisplay").style.display = "block";
    
    document.getElementById("startGameButton").style.display = "none"; 
    document.getElementById("restart").classList.remove("hidden"); 
    document.getElementById("quit").classList.remove("hidden"); 

    document.querySelector(".game-container").classList.remove("hidden");
    document.querySelector(".buttons").classList.remove("hidden");
    document.getElementById("scoreboard").classList.remove("hidden");

    console.log("Game started");
    startRoundTimer();
}
function startRoundTimer() {
    clearTimeout(roundTimer);
    timeLeft = 10;
    updateTimerDisplay();
    roundTimer = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(roundTimer);
                game(null);
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById("timerDisplay").innerText = `Round ${currentRound + 1} - Time Left: ${timeLeft}s`;
}

function game(userChoice) {
    playSound();
    clearInterval(roundTimer);
    document.getElementById("hand1").classList.add("hand-animation");
    document.getElementById("hand2").classList.add("hand-animation");
    setTimeout(() => {
        document.getElementById("hand1").classList.remove("hand-animation");
        document.getElementById("hand2").classList.remove("hand-animation");
    }, 500);

    let computerChoice = Math.floor(Math.random() * 3);

    if (userChoice !== null) {
        document.getElementById("hand1").innerHTML = hands[userChoice];
    } else {
        document.getElementById("hand1").innerHTML = "<img src='assets/timeout.png'>";
    }
    document.getElementById("hand2").innerHTML = hands[computerChoice];

    let resultMessage = "";

    if (userChoice === null) {
        resultMessage = "Time's Up! Computer Wins!";
        computerScore++;
    } else if (userChoice === computerChoice) {
        resultMessage = "It's a Draw!";
    } else if (
        (userChoice === 0 && computerChoice === 2) ||
        (userChoice === 1 && computerChoice === 0) ||
        (userChoice === 2 && computerChoice === 1)
    ) {
        userScore++;
        resultMessage = "You Win!";
    } else {
        computerScore++;
        resultMessage = "Computer Wins!";
    }

    document.getElementById("scoreboard").innerText = `Score: ${userScore} - ${computerScore}`;

    currentRound++;

    if (currentRound >= totalRounds) {
        setTimeout(() => {
            let finalMessage = userScore > computerScore ? "You Won the Game!" : (userScore === computerScore ? "It's a Tie!" : "Computer Wins!");
            showResult(finalMessage);
        }, 1000);
    } else {
        startRoundTimer();
    }
}

function showResult(message) {
    playSound();
    document.getElementById("resultText").innerText = message;
    document.getElementById("resultModal").style.display = "block";
    document.getElementById("rock").style.display = "none";
    document.getElementById("paper").style.display = "none";
    document.getElementById("scissors").style.display = "none";
    document.getElementById("restart").style.display = "inline-block";
    document.getElementById("pause").style.display = "none";
}

function closeModal() {
    playSound();
    document.getElementById("resultModal").style.display = "none";
}

function restartGame() {
    playSound();
    document.getElementById("restart").classList.add("hidden");
    document.getElementById("startGameButton").style.display = "inline-block";
    document.querySelector(".game-container").classList.add("hidden");
    document.querySelector(".buttons").classList.add("hidden");
    document.getElementById("scoreboard").classList.add("hidden");
    document.getElementById("pause").classList.add("hidden");
    document.getElementById("settings").classList.add("hidden");
    document.getElementById("timerDisplay").classList.add("hidden");

    document.getElementById("hand1").innerHTML = "<img src='assets/download.png'>";
    document.getElementById("hand2").innerHTML = "<img src='assets/download.png'>";
    document.getElementById("scoreboard").innerText = "Score: 0 - 0";
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("timerDisplay").style.display = "none";
    document.getElementById("createRoom").style.display = "inline-block";
    document.getElementById("joinRoom").style.display = "inline-block";
    document.getElementById("restart").style.display = "none";
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function pauseGame() {
    playSound();
    isPaused = !isPaused;
    document.getElementById("pause").innerText = isPaused ? "▶" : "❚❚";
    document.getElementById("rock").disabled = isPaused;
    document.getElementById("paper").disabled = isPaused;
    document.getElementById("scissors").disabled = isPaused;
    if (isPaused) {
        clearInterval(roundTimer);
        backgroundMusic.pause();
    } else {
        if (isMusicOn) backgroundMusic.play();
        startRoundTimer();
    }
}

function toggleSettings() {
    playSound();
    let modal = document.getElementById("settingsModal");
    if (modal.style.display === "block") {
        modal.style.display = "none";
        if (isPaused) {
            return;
        }
        isPaused = false;
        document.getElementById("pause").innerText = "❚❚";
        document.getElementById("rock").disabled = false;
        document.getElementById("paper").disabled = false;
        document.getElementById("scissors").disabled = false;
        if (isMusicOn) backgroundMusic.play();
        startRoundTimer();
    } else {
        modal.style.display = "block";
        isPaused = true;
        document.getElementById("pause").innerText = "▶";
        document.getElementById("rock").disabled = true;
        document.getElementById("paper").disabled = true;
        document.getElementById("scissors").disabled = true;
        clearInterval(roundTimer);
        backgroundMusic.pause();
    }
}

function toggleSound() {
    playSound();
    let isSoundOn = document.getElementById("soundToggle").checked;
    toggleMusic();
    console.log("Sound:", isSoundOn ? "On" : "Off");
}

function adjustBrightness() {
    playSound();
    let brightness = document.getElementById("brightness").value;
    document.body.style.filter = `brightness(${brightness}%)`;
}


function login() {
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    console.log("Logged in as:", name);
    document.getElementById("login").classList.add("hidden");
    document.getElementById("gameContent").classList.remove("hidden");
    document.getElementById("instructions").classList.remove("hidden");

}



function instruct()
{
    document.getElementById('instructions').classList.remove('hidden');
    
}

function instruct() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    
}

window.onload = function() {
    //showInstructions();/
    
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("restart").classList.add("hidden");
    document.getElementById("quit").classList.add("hidden");
});



function gameOver() {
    document.getElementById("restart").classList.remove("hidden"); 
    document.getElementById("quit").classList.remove("hidden"); 

    console.log("Game over");
}

function restartGame() {
    console.log("Game restarted");
    location.reload(); 
}

function quitGame() {
    console.log("Game exited");
    location.reload(); 
}


document.getElementById('reloadBtn').addEventListener("click", function() {
    location.reload(); // reloads the page
  });
  

  