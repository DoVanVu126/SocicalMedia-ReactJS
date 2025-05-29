import React, { useState } from "react";
import "../style/TicTacToe.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];

  const calculateWinner = (board) => {
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = board.slice();
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);

    const win = calculateWinner(newBoard);
    if (win) setWinner(win);
    else setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  };

  return (
    <>
      <Header />
      <Sidebar />
      <div className="ttt-container">
        <h2 className="ttt-title">Tic Tac Toe - Cờ Caro 3x3</h2>
        <div className="ttt-board" style={{display:"grid", gridTemplateColumns:"repeat(3, 100px)", gap:"5px", justifyContent:"center"}}>
          {board.map((cell, i) => (
            <button
              key={i}
              className="ttt-cell"
              onClick={() => handleClick(i)}
              style={{cursor: winner || cell ? "default" : "pointer"}}
            >
              {cell}
            </button>
          ))}
        </div>
        <p className="ttt-status">
          {winner
            ? `🎉 Người chơi ${winner} thắng!`
            : `Lượt của: ${xIsNext ? "X" : "O"}`}
        </p>
        <button className="ttt-reset-btn" onClick={resetGame}>Chơi lại</button>
      </div>
    </>
  );
}
