class AudioController {
    constructor() {

        this.bgMusic = new Audio('');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/match.wav');
        this.victorySound = new Audio('Assets/Audio/victory.wav');
        this.gameOverSound = new Audio('Assets/Audio/gameover.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip() {
        this.flipSound.play();
    }

    match() {
        this.matchSound.play();
    }

    victory() {
        this.stopMusic();
        this.victorySound.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MixOrMatch {
    constructor(totalTime, cards) {

        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    saveScore() {
        let userNick = document.getElementById("nick").value;
        let e = document.getElementById("grid-size");
        let gridSize = e.options[e.selectedIndex].value;
        let userTime = this.totalTime - this.timeRemaining;
        let userFlips = document.getElementById("flips").innerText;
        let gridSizeBonus = 1;

        if(gridSize == 2)
            gridSizeBonus = 1;
        else if(gridSize == 4)
            gridSizeBonus = 10;
        else if (gridSize == 6)
            gridSizeBonus = 100;
        else if (gridSize == 8)
            gridSizeBonus = 500;

        let userScore = Math.floor((gridSizeBonus+this.timeRemaining-userTime)/(userFlips));
        let ajax = new XMLHttpRequest();
        let url = "scores.json";
        ajax.open("GET", url, true);
        ajax.send(null);
        ajax.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                if(this.responseText != "" && this.responseText != null) {
                    var data = JSON.parse(this.responseText);
                    data.user.push({
                        "name": userNick,
                        "score": userScore
                    });
                    const jsonString = JSON.stringify(data);
                    ajax.open("POST", "receive.php");
                    ajax.setRequestHeader("Content-Type", "application/json");
                    ajax.send(jsonString);
                    
                }
             }
             else if(this.readyState == 4 && this.status == 404)
             {
                const data = {"user":[{"name": userNick, "score": userScore}]};
                const jsonString = JSON.stringify(data);
                ajax.open("POST", "receive.php");
                ajax.setRequestHeader("Content-Type", "application/json");
                ajax.send(jsonString);
             }
         }
     }


    startGame() {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;
        document.getElementById('game-info-id').style.display = flex;

        setTimeout(() => {
            //this.audioController.startMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);

        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck)
                this.checkForCardMatch(card);
            else
                this.cardToCheck = card;
        }
    }

    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMissmatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();

        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }

    cardMissmatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }

    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }

    gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
        setTimeout(() => {
            this.hideCards();
        }, 1500);
        document.getElementById('start-btn').disabled = false;
        document.getElementById('start-btn').style.backgroundColor = '#ed3330';
    }

    victory() {
        clearInterval(this.countDown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
        setTimeout(() => {
            this.hideCards();
        }, 3000);
        document.getElementById('start-btn').disabled = false;
        document.getElementById('start-btn').style.backgroundColor = '#ed3330';
        this.saveScore();
    }

    shuffleCards() { // algorytm tasowania Fishera–Yatesa dla kolejności grida CSS'a
        for(let i = this.cardsArray.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randomIndex].style.order = i;
            this.cardsArray[i].style.order = randomIndex;
        }
    }

    canFlipCard(card) {
        return (!this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck);
    }
}

function appendCard(backSource, frontSource, number) {
    const cardElement = document.createElement('div');
    cardElement.id = 'card-element'+number;
    cardElement.className = 'card';
    document.getElementById('card-grid').appendChild(cardElement);

    const cardBackElement = document.createElement('div');
    cardBackElement.id = 'card-back'+number;
    cardBackElement.className = 'card-back card-face';
    document.getElementById('card-element'+number).appendChild(cardBackElement);

    const cardFrontElement = document.createElement('div');
    cardFrontElement.id = 'card-front'+number;
    cardFrontElement.className = 'card-front card-face';
    document.getElementById('card-element'+number).appendChild(cardFrontElement);

    const cardBack = document.createElement('img');
    cardBack.className = 'fsociety';
    cardBack.src = backSource;
    document.getElementById('card-back'+number).appendChild(cardBack);

    const cardFront = document.createElement('img');
    cardFront.className = 'card-value';
    cardFront.src = frontSource;
    document.getElementById('card-front'+number).appendChild(cardFront);

}

function removeCards() {
    let element = null;
    for(let i=0; i<8; i++)
    {
        let num1 = i.toString();
        for(let j=0; j<2; j++)
        {
            let num2 = j.toString();
            element = document.getElementById('card-element'+num1+num2);
            if(element != null)
                element.remove();
        } 
    }
}

function getRank() {
    let table = document.getElementById("highscores");
    table.innerHTML = "";
    let xhr = new XMLHttpRequest();
    let url = "scores.json";

    xhr.open("GET", url, true);
    xhr.send();

    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(this.responseText != "") 
            {
                var retrievedScores = JSON.parse(this.responseText);
                table.innerHTML += "<thead><tr><th>Nazwa gracza</th><th>Punkty</th></tr></thead>";
                table.innerHTML += '<tbody id="table-body">';
                let tbody = document.getElementById("table-body");
                //retrievedScores.sort((a, b) => (a.score < b.score) ? 1 : -1);
                for (let i = 0; i < retrievedScores.user.length; i++) {
                    var row = tbody.insertRow(0);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    cell1.innerHTML = retrievedScores.user[i].name;
                    cell2.innerHTML = retrievedScores.user[i].score;
                }
                table.innerHTML += "</tbody>";
            }
        }
    }
}

function ready() {
    getRank();
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let startBtn = document.getElementById('start-btn');
    let game;

    let imagesSrc = ["Assets/Images/angela.jpg", "Assets/Images/darlene.jpg", 
                "Assets/Images/dominique.jpg", "Assets/Images/elliot.jpg", 
                "Assets/Images/joanna.jpg", "Assets/Images/mrRobot.jpg", 
                "Assets/Images/price.jpg", "Assets/Images/tyrell.jpg"];

    let reverseSrc = "Assets/Images/card_back_small.png";
    
    startBtn.addEventListener('click', () => {
        let e = document.getElementById("game-level");
        let gameLevel = e.options[e.selectedIndex].value;

        let f = document.getElementById("grid-size");
        let gridSize = f.options[f.selectedIndex].value;

        let time = 90;
        let flag = true;

        if(document.getElementById('nick').textContent == "")
        {
            alert("Enter your nickname!");
            flag = false;
        }

        if(gridSize == 'stop')
        {
            alert("Choose a grid size!");
            flag = false;
        }

        if(gameLevel == 'easy')
            time = 90;
        else if(gameLevel == 'normal')
            time = 60;
        else if (gameLevel == 'hard')
            time = 30;
        else if(gameLevel == 'stop')
        {
            alert("Choose a game level!");
            flag = false;
        }

        if(flag)
        {
            startBtn.disabled = true;
            startBtn.style.backgroundColor = '#434343';
            removeCards();

            for(let i=0; i<gridSize; i++)
            {
                let num1 = i.toString();
                for(let j=0; j<2; j++)
                {
                    let num2 = j.toString();
                    appendCard(reverseSrc, imagesSrc[i], num1+num2);
                } 
            }
            cards = Array.from(document.getElementsByClassName('card'));
            
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    game.flipCard(card);
                });
            });

            game = new MixOrMatch(time, cards);
            game.startGame();
        }
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
        });
    });
}

if(document.readyState === 'loading')
{
    document.addEventListener('DOMContentLoaded', ready());
} else {
    ready();
}