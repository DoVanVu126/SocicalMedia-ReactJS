import React, { useState, useEffect } from "react";
import "../style/ClickSpeedTest.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
const generateBoxes = () => {
    return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        status: "waiting",
        startTime: null,
        reactionTime: null,
    }));
};

export default function ReactionTimeMultiBox() {
    const [boxes, setBoxes] = useState(generateBoxes);

    useEffect(() => {
        const timers = boxes.map((box, index) => {
            const delay = Math.random() * 3000 + 2000; // 2-5 giây
            return setTimeout(() => {
                setBoxes(prev =>
                    prev.map(b =>
                        b.id === box.id
                            ? { ...b, status: "now", startTime: Date.now() }
                            : b
                    )
                );
            }, delay);
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    const handleClick = (id) => {
        setBoxes(prev =>
            prev.map(box => {
                if (box.id === id) {
                    if (box.status === "now") {
                        const reactionTime = Date.now() - box.startTime;
                        return { ...box, status: "done", reactionTime };
                    } else if (box.status === "waiting") {
                        return { ...box, status: "tooSoon" };
                    }
                }
                return box;
            })
        );
    };

    const resetGame = () => {
        setBoxes(generateBoxes());
    };

    return (
        <>
            <Header />
            <Sidebar />
            <div className="reaction-multi">
                <h2>⏱️ Reaction Time – Nhiều ô</h2>
                <div className="multi-box-grid">
                    {boxes.map((box) => (
                        <div
                            key={box.id}
                            className={`box ${box.status}`}
                            onClick={() => handleClick(box.id)}
                        >
                            {box.status === "done"
                                ? `${box.reactionTime}ms`
                                : box.status === "tooSoon"
                                    ? "Sớm quá!"
                                    : box.status === "now"
                                        ? "NHẤN NGAY!"
                                        : "Chờ..."}
                        </div>
                    ))}
                </div>
                <button onClick={resetGame}>Chơi lại</button>
            </div>
        </>
    );
}
