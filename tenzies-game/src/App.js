import React from "react";
import Die from "./components/Die";
import {nanoid} from "nanoid";
import ReactConfetti from "react-confetti";
import Scoreboard from "./components/Scoreboard";

export default function App() {
  const [dice, setDice] = React.useState(allNewDice());

  const [tenzies, setTenzies] = React.useState(false);

  const [rolls, setRolls] = React.useState(0);
  const [bestRolls, setBestRolls] = React.useState(
    JSON.parse(localStorage.getItem("bestRolls")) || 0
  );

  const [bestTime, setBestTime] = React.useState(
    JSON.parse(localStorage.getItem("bestTime")) || 0
  );

  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const allSameValue = dice.every((die) => die.value === dice[0].value);
    if (allHeld && allSameValue) {
      setTenzies(true);
      setStart(false);

      setRecords();
    }
  }, [dice]);

  function setRecords() {
    if (!bestRolls || rolls < bestRolls) {
      setBestRolls(rolls);
    }

    const timeFloored = Math.floor(time / 10);
    if (!bestTime || timeFloored < bestTime) {
      setBestTime(timeFloored);
    }
  }

  React.useEffect(() => {
    localStorage.setItem("bestRolls", JSON.stringify(bestRolls));
  }, [bestRolls]);

  React.useEffect(() => {
    localStorage.setItem("bestTime", JSON.stringify(bestTime));
  }, [bestTime]);

  function getRandomInt() {
    return Math.ceil(Math.random() * 6);
  }

  function generateNewDie() {
    return {
      value: getRandomInt(),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  const diceElements = dice.map((die) => {
    return (
      <Die
        key={die.id}
        value={die.value}
        isHeld={die.isHeld}
        holdDice={() => holdDice(die.id)}
      />
    );
  });

  function rollDice() {
    if (!tenzies) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
      updateRolls();
    } else {
      resetGame();
    }
  }

  function resetGame() {
    setTenzies(false);
    setDice(allNewDice());
    setRolls(0);
    setStart(true);
    setTime(0);
  }

  function updateRolls() {
    return setRolls((oldRolls) => oldRolls + 1);
  }

  const [time, setTime] = React.useState(0);
  const [start, setStart] = React.useState(true);

  React.useEffect(() => {
    let interval = null;
    if (start) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [start]);

  return (
    <div className="app-container shadow-shorter">
      {tenzies && <ReactConfetti />}
      <main>
        <h1 className="title">Tenzies</h1>
        {!tenzies && (
          <p className="instructions">
            Roll until all dice are the same.
            <br /> Click each die to freeze it at its current value between
            rolls.
          </p>
        )}
        {tenzies && <p className="winner gradient-text"> YOU WON!</p>}

        <div className="stats-container">
          <p>Rolls: {rolls}</p>
          <p>
            Timer: {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
            {("0" + ((time / 10) % 1000)).slice(-2)}
          </p>
        </div>

        <div className="dice-container">{diceElements}</div>

        <button className="roll-dice" onClick={rollDice}>
          {tenzies ? "New game" : "Roll"}
        </button>

        <Scoreboard bestRolls={bestRolls} bestTime={bestTime} />
      </main>
      <Footer />
    </div>
  );
}
