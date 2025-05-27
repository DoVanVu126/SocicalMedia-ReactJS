import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/DinoGame.css";

export default function DinoGame() {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  // Split "Play Game" into individual letters for intro animation
  const title = "Play Game";
  const letters = title.split('');

  // Use refs to persist game state across renders
  const dinoRef = useRef({
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    vy: 0,
    gravity: 1.5,
    jumpPower: -18,
    grounded: true,
  });
  const cactusArrayRef = useRef([]);
  const scoreCounterRef = useRef(0);
  const animationFrameRef = useRef(null);
  const spawnTimerRef = useRef(null);

  // Intro animation timing
  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 1800); // 0.5s icon + 1s text + 0.3s buffer
    return () => clearTimeout(introTimer);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (showIntro) return; // Skip until intro is done
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
    }
  }, [navigate, showIntro]);

  // Resize canvas to fit card
  useEffect(() => {
    if (showIntro) return; // Skip until intro is done
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const card = cardRef.current;
      if (canvas && card) {
        const cardWidth = card.offsetWidth - 40;
        const maxCanvasWidth = Math.min(cardWidth, 800);
        canvas.style.width = `${maxCanvasWidth}px`;
        canvas.style.height = `${(maxCanvasWidth * 200) / 800}px`;
        canvas.width = maxCanvasWidth;
        canvas.height = (maxCanvasWidth * 200) / 800;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [showIntro]);

  const resetGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    dinoRef.current = {
      x: 50,
      y: 150,
      width: 40,
      height: 40,
      vy: 0,
      gravity: 1.5,
      jumpPower: -18,
      grounded: true,
    };
    cactusArrayRef.current = [];
    scoreCounterRef.current = 0;
    setScore(0);
    setGameOver(false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = setInterval(spawnCactus, 1500);
    update();
  };

  const spawnCactus = () => {
    cactusArrayRef.current.push({
      x: canvasRef.current.width,
      y: 160,
      width: 20,
      height: 40,
    });
  };

  const update = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dinoRef.current.vy += dinoRef.current.gravity;
    dinoRef.current.y += dinoRef.current.vy;

    if (dinoRef.current.y >= 150) {
      dinoRef.current.y = 150;
      dinoRef.current.vy = 0;
      dinoRef.current.grounded = true;
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(
      dinoRef.current.x,
      dinoRef.current.y,
      dinoRef.current.width,
      dinoRef.current.height
    );

    for (let i = cactusArrayRef.current.length - 1; i >= 0; i--) {
      const c = cactusArrayRef.current[i];
      c.x -= 6;

      ctx.fillStyle = "#228b22";
      ctx.fillRect(c.x, c.y, c.width, c.height);

      if (
        dinoRef.current.x < c.x + c.width &&
        dinoRef.current.x + dinoRef.current.width > c.x &&
        dinoRef.current.y < c.y + c.height &&
        dinoRef.current.y + dinoRef.current.height > c.y
      ) {
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(spawnTimerRef.current);
        setGameOver(true);
        return;
      }

      if (c.x + c.width < 0) {
        cactusArrayRef.current.splice(i, 1);
      }
    }

    scoreCounterRef.current++;
    setScore(scoreCounterRef.current);

    ctx.fillStyle = "black";
    ctx.font = "20px sans-serif";
    ctx.fillText("Score: " + scoreCounterRef.current, canvas.width - 150, 30);

    animationFrameRef.current = requestAnimationFrame(update);
  };

  // Game initialization
  useEffect(() => {
    if (showIntro) return; // Skip until intro is done

    const canvas = canvasRef.current;
    if (!canvas) return; // Guard against null canvas

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Guard against null context

    const handleKeyDown = (e) => {
      if (e.code === "Space" && dinoRef.current.grounded && !gameOver) {
        dinoRef.current.vy = dinoRef.current.jumpPower;
        dinoRef.current.grounded = false;
      }
      if (e.code === "Enter" && gameOver) {
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    spawnTimerRef.current = setInterval(spawnCactus, 1500);
    update();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, showIntro]);

  if (showIntro) {
    return (
      <div className="dino-intro-container">
        <div className="dino-icon">🦖</div>
        <div className="dino-intro-text">
          {letters.map((letter, index) => (
            <span
              key={index}
              className="dino-intro-letter"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main dino-main">
      <Header />
      <Sidebar />
      <div className="dino-container">
        <div ref={cardRef} className="card dino-card">
          <h3 className="card-title text-center mb-4">Dino Game</h3>
          <div style={{ textAlign: "center" }}>
            <canvas ref={canvasRef} className="dino-canvas" />
            {gameOver && (
              <div className="game-over-container" style={{ marginTop: "15px" }}>
                <div className="game-over-text" style={{ color: "#d32f2f", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>
                  Game Over! Score: {score}
                </div>
                <button className="btn btn-primary dino-btn" onClick={resetGame}>
                  Chơi Lại
                </button>
              </div>
            )}
            {!gameOver && (
              <div className="score-text" style={{ marginTop: "10px", fontSize: "16px", color: "#606770" }}>
                Score: {score}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}