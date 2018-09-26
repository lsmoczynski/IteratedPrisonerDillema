let sequenceStep = 0;

const alwaysCooperate = () => { return true }
const alwaysBetray = () => { return false }
const random = () => {
    if (Math.random() > 0.5) return true;
    return false;
}

const titForTat = (playerPlays) => {
    if (playerPlays.length === 0) return true;
    return playerPlays[playerPlays.length - 1];
}

const titFor2Tats = (playerPlays, computerPlays) => {
    if (playerPlays.length < 2) return true;
    const lastIdx = playerPlays.length - 1;
    if (!playerPlays[lastIdx]
        && !playerPlays[lastIdx - 1]) return false;
    if (playerPlays[lastIdx]
        && playerPlays[lastIdx - 1]) return true;
    return computerPlays[lastIdx];
}

const remorsefulProber = (playerPlays, computerPlays) => {
    if (playerPlays.length === 0) return true;
    if (
        Math.random() < 0.15
        && playerPlays[playerPlays.length - 1]
        && !sequenceStep
    ) {
        sequenceStep = 2;
        return false;
    }
    if (sequenceStep) {
        sequenceStep--;
        if (!sequenceStep
            && !playerPlays[playerPlays.length - 1]) return true;
    }
    return playerPlays[playerPlays.length - 1];
}

const pavlov = (playerPlays, computerPlays) => {
    if (playerPlays.length === 0) return true;
    const lastIdx = playerPlays.length - 1;
    const lastPoints = getPoints(computerPlays[lastIdx], playerPlays[lastIdx]);
    if (lastPoints === 3 || lastPoints === 5) return computerPlays[lastIdx];
    return !computerPlays[lastIdx];
}
const pavlovWithRandom = (playerPlays, computerPlays) => {
    if (playerPlays.length === 0) return true;
    const lastIdx = playerPlays.length - 1;
    let ret;
    const lastPoints = getPoints(computerPlays[lastIdx], playerPlays[lastIdx]);  
    ret = !computerPlays[lastIdx];
    if (lastPoints === 3 || lastPoints === 5) ret = computerPlays[lastIdx];
    if (Math.random() < 0.1) ret = !ret;
    return ret;
}

const softGrudger = (playerPlays, computerPlays) => {
    const plays = playerPlays.length;
    const lastIdx = plays - 1;
    if (sequenceStep) {
        sequenceStep--;
        if ([0,1].includes(sequenceStep)) return true;
        return false;
    }
    if (playerPlays[lastIdx] === false) {
        sequenceStep = 5;
        return false;
    }
    return true;
}

const gradual = (playerPlays, computerPlays) => {
    const plays = playerPlays.length;
    const lastIdx = plays - 1;
    if (sequenceStep) {
        sequenceStep--;
        if ([0,1].includes(sequenceStep)) return true;
        return false;
    }
    if (playerPlays[lastIdx] === false) {
        sequenceStep = playerPlays.filter(play => !play).length + 1;
        return false;
    }
    return true;
}

const testStrategy = (playerPlays) => {
    const plays = playerPlays.length;
    if (plays === 0) return true;
    if (plays === 1) return true;
    const lastIdx = plays - 1;
    if (!playerPlays[lastIdx] && !playerPlays[lastIdx - 1]) return false;
    return true;
}

const strategiesDict = {
    alwaysCooperate,
    alwaysBetray,
    random,
    titFor2Tats,
    softGrudger,
    gradual,
    titForTat,
    remorsefulProber,
    pavlov,
    pavlovWithRandom,
};

// helpers
const getPoints = (yourChoice, opponentsChoice) => {
    if (yourChoice && opponentsChoice) return 3;
    if (!opponentsChoice && !yourChoice) return 1;
    if (!opponentsChoice && yourChoice) return 0;
    if (!yourChoice && opponentsChoice) return 5;
}

const wonOrLost = (yourPoints, opponentPoints) => {
    if (yourPoints === opponentPoints) return 'drew';
    if (yourPoints > opponentPoints) return 'won';
    return 'lost';
}

const start = (test = false) => {
    const gameStrategies = test
        ? { testStrategy }
        : strategiesDict
    // match state
    const reports = [];
    const strategies = Object.keys(gameStrategies);

    // single game state
    let strategy;
    let strategyName;
    let playerScore;
    let computerScore;
    let playerPlays;
    let computerPlays;
    let roundsNumber;

    // methods for updating screen
    const updateRoundTitle = () => {
        document.getElementById('game_number').textContent = `Game ${reports.length + 1}`;
    };

    const updateLastRoundResult = (isGameResult = false) => {
        const playerPlay = playerPlays[playerPlays.length - 1];
        const computerPlay = computerPlays[computerPlays.length - 1]
        document.getElementById('last_round').innerHTML = isGameResult
            ? `The round have ended, ${playerScore > computerScore ? 'you' : 'computer'} won`
            : ('Last round you ' +
                (playerPlay ? 'cooperated' : 'betrayed') +
                ', and computer ' + (computerPlay ? 'cooperated.' : 'betrayed.') +
                '</br> You scored ' + getPoints(playerPlay, computerPlay) +
                ', and computer scored ' + getPoints(computerPlay, playerPlay));          
    };

    const updateScores = () => {
        document.getElementById('player_score').textContent = `Player score: ${playerScore}`;
        document.getElementById('computer_score').textContent = `Computer score: ${computerScore}`;
    };

    // methods updating game state
    const initializeRound = () => {
        strategyName = strategies.splice(
            Math.floor(Math.random() * strategies.length)
            , 1)[0];
        strategy = gameStrategies[strategyName];
        playerScore = 0;
        computerScore = 0;
        playerPlays = [];
        computerPlays = [];
        sequenceStep = 0;
        roundsNumber = test
            ? 20
            : (Math.floor(Math.random() * 30)) + 70;
    }

    const createReport = () => {
        reports.push({
            game: reports.length + 1,
            strategyName,
            playerScore,
            computerScore,
            playerPlays,
            computerPlays,
            winner: (playerScore > computerScore) ? 'player' : 'computer',
        });
    }

    const endGame = () => {
        document.getElementById('game').style.display = 'none';
        document.getElementById('result').style.display = 'flex';        
        const result = document.getElementById('result_message');
        const reportSummary = reports
            .map(report => 'Game ' + report.game +
                ' you ' + wonOrLost(report.playerScore, report.computerScore) +
                ' against ' + report.strategyName + ' strategy. You scored ' + report.playerScore +
                ' and computed scored ' + report.computerScore + ' in '
                + (report.playerPlays.length) + ' rounds.')
            .join('</br>');
        result.innerHTML = `The game has ended. </br>` + reportSummary;
    }

    const handlePostPlay = () => {
        if (!roundsNumber) {
            if (!strategies.length) {
                createReport();
                endGame();
            } else {
                createReport();
                updateLastRoundResult(true);
                initializeRound();
                updateRoundTitle();             
            }
        } else {
            updateScores();
            updateLastRoundResult();
        }
    }

    const handlePlay = (isCooperating) => {
        roundsNumber--;
        const computerPlay = strategy(playerPlays, computerPlays);
        playerScore+= getPoints(isCooperating, computerPlay);
        computerScore+= getPoints(computerPlay, isCooperating);
        playerPlays.push(isCooperating);
        computerPlays.push(computerPlay);
        handlePostPlay();
    }

    const downloadCsv = () => {
        let rows = [];
        reports.forEach((report, idx) => {
            const rounds = report.playerPlays.length;
            const normalisedPlayerPlays = report.playerPlays
                .map(Number)
                .concat(new Array(100 - rounds).fill('n/a'));
            const normalisedComputerPlays = report.computerPlays
                .map(Number)
                .concat(new Array(100 - rounds).fill('n/a'));
            rows.push([
                report.strategyName,
                rounds,
                report.playerScore,
                report.computerScore,
                ...normalisedComputerPlays,
                ...normalisedPlayerPlays,
            ])
        });
        let csvContent = "data:text/csv;charset=utf-8,"; 
        rows.forEach((rowArray) => {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        }); 
        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);       
    }
   
    initializeRound();
    updateRoundTitle();
    updateScores();
    document.getElementById('betray').addEventListener('click', () => handlePlay(false));
    document.getElementById('cooperate').addEventListener('click', () => handlePlay(true));
    document.getElementById('download').addEventListener('click', downloadCsv);
    document.getElementById('start').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
}

document.getElementById('start_button').addEventListener('click', () => start());
document.getElementById('test_button').addEventListener('click', () => start(true));
document.getElementById('replay').addEventListener('click', () => {
    document.getElementById('last_round').innerHTML = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('start').style.display = 'flex';
});