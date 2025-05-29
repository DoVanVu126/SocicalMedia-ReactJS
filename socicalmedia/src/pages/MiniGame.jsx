import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/MiniGame.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
const hints = [
    "Cần gợi ý trò chơi không?",
    "Hãy phiêu lưu cùng Dino Game vui nhộn!",
    "Chơi Memory Game để thử khả năng ghi nhớ của bạn!",
    "Tic Tac Toe - game trí tuệ thử thách bạn!",
    "Thử vận tốc tay với Click Speed Test nhé!",
    "🤖 Hãy chọn một game để bắt đầu chơi nhé!",
];

const games = [
    {
        name: "Dino Game",
        image: "/images/dinogame.png",
        route: "/dinogame",
    },
    {
        name: "Memory Game",
        image: "/images/memorygame.webp",
        route: "/memorygame",
    },
    {
        name: "Tic Tac Toe",
        image: "/images/cocarogame.jpg",
        route: "/tictactoe",
    },
    {
        name: "Click Speed Test",
        image: "/images/lienquan.jpg",
        route: "/clickspeedtest",
    },
];

export default function MiniGame() {
    const navigate = useNavigate();
    const [showTip, setShowTip] = useState(true);

    const [hintIndex, setHintIndex] = useState(0);

    const handleRobotClick = () => {
        setHintIndex((prev) => (prev + 1) % hints.length);
    };

    return (
        <>
            <Header />
            <Sidebar />
            <div className="minigame-container">
                <h2>Mini Games</h2>
                <div className="game-icons">
                    {games.map((game) => (
                        <div
                            key={game.route}
                            className="game-icon"
                            onClick={() => navigate(game.route)}
                            style={{ cursor: "pointer", textAlign: "center", margin: 20 }}
                        >
                            <img
                                src={game.image}
                                alt={game.name}
                                style={{
                                    width: "120px",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                            />
                            <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                                {game.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="robot-helper"
                onClick={handleRobotClick}
                style={{ position: "fixed", bottom: 20, right: 20, cursor: "pointer" }}
            >
                <img
                    src="/images/robot-removebg-preview.png"
                    alt="Game Assistant Robot"
                    style={{ width: 100, height: "auto" }}
                />

                <div className="robot-message">{hints[hintIndex]}</div>
            </div>
        </>
    );
}
