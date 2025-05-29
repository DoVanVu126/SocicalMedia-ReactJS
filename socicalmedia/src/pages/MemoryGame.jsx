import React, { useState, useEffect } from "react";
import '../style/MemoryGame.css';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const cardImages = [
    { src: "/images/helmet.jpg", matched: false },
    { src: "/images/potion.avif", matched: false },
    { src: "/images/ring.avif", matched: false },
    { src: "/images/scroll.jpg", matched: false },
    { src: "/images/shield.jpg", matched: false },
    { src: "/images/sword.jpg", matched: false },
];

export default function MemoryGame() {
    const [cards, setCards] = useState([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState(null);
    const [choiceTwo, setChoiceTwo] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    const shuffleCards = () => {
        const shuffledCards = [...cardImages, ...cardImages]
            .sort(() => Math.random() - 0.5)
            .map((card) => ({ ...card, id: Math.random() }));
        setChoiceOne(null);
        setChoiceTwo(null);
        setCards(shuffledCards);
        setTurns(0);
        setGameWon(false);
    };

    const handleChoice = (card) => {
        if (!disabled) {
            choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
        }
    };

    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setCards((prevCards) =>
                    prevCards.map((card) =>
                        card.src === choiceOne.src ? { ...card, matched: true } : card
                    )
                );
                resetTurn();
            } else {
                setTimeout(() => resetTurn(), 1000);
            }
        }
    }, [choiceOne, choiceTwo]);

    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((prev) => prev + 1);
        setDisabled(false);
    };

    // Dùng useEffect để kiểm tra chiến thắng mỗi khi cards thay đổi
    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.matched)) {
            setGameWon(true);
        }
    }, [cards]);

    useEffect(() => {
        shuffleCards();
    }, []);

    return (
        <>
            <Header />
            <Sidebar />
            <div className="memory-game-memory">
                <h2>🧠 Memory Game</h2>
                <button onClick={shuffleCards}>New Game</button>
                <div className="card-grid-memory">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className={`card-memory ${card === choiceOne || card === choiceTwo || card.matched ? "flipped" : ""}`}
                            onClick={() => handleChoice(card)}
                        >
                            <img className="front-memory" src={card.src} alt="card front" />
                            <img className="back-memory" src="/images/cover.jpg" alt="card back" />
                        </div>
                    ))}
                </div>
                <p>Turns: {turns}</p>
                {gameWon && (
                    <div className="win-message">
                        🎉 Chúc mừng! Bạn đã chiến thắng! 🎉
                    </div>
                )}
            </div>
        </>
    );
}
