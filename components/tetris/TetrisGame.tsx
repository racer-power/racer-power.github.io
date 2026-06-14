"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { saveHighScore } from "@/app/actions/scores";
import { GameBoard, MiniBoard } from "@/components/tetris/GameBoard";
import {
  createInitialState,
  gameReducer,
  getDropIntervalMs,
} from "@/lib/tetris/engine";
import type { GameStatus } from "@/lib/tetris/types";

export interface TopScoreEntry {
  id: number;
  player: string;
  score: number;
  lines: number;
  level: number;
}

interface TetrisGameProps {
  topScores: TopScoreEntry[];
}

function statusLabel(status: GameStatus): string {
  switch (status) {
    case "idle":
      return "Press Start";
    case "playing":
      return "Playing";
    case "paused":
      return "Paused";
    case "gameover":
      return "Game Over";
  }
}

export function TetrisGame({ topScores: initialTopScores }: TetrisGameProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [playerName, setPlayerName] = useState("Player");
  const [topScores, setTopScores] = useState(initialTopScores);
  const [saved, setSaved] = useState(false);
  const lastTick = useRef(0);
  const savedRef = useRef(false);

  const handleStart = useCallback(() => {
    savedRef.current = false;
    setSaved(false);
    dispatch({ type: "start" });
  }, []);

  const handleSaveScore = useCallback(async () => {
    if (savedRef.current || state.status !== "gameover") return;

    savedRef.current = true;
    await saveHighScore({
      player: playerName,
      score: state.score,
      lines: state.lines,
      level: state.level,
    });
    setSaved(true);
    setTopScores((prev) => {
      const next = [
        ...prev,
        {
          id: Date.now(),
          player: playerName.trim() || "Player",
          score: state.score,
          lines: state.lines,
          level: state.level,
        },
      ];
      return next.sort((a, b) => b.score - a.score).slice(0, 5);
    });
  }, [playerName, state.level, state.lines, state.score, state.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        dispatch({ type: "move", dx: -1, dy: 0 });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        dispatch({ type: "move", dx: 1, dy: 0 });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        dispatch({ type: "softDrop" });
      } else if (event.key === "ArrowUp" || event.key === "x" || event.key === "X") {
        event.preventDefault();
        dispatch({ type: "rotate", direction: 1 });
      } else if (event.key === "z" || event.key === "Z") {
        event.preventDefault();
        dispatch({ type: "rotate", direction: -1 });
      } else if (event.key === " ") {
        event.preventDefault();
        if (state.status === "idle" || state.status === "gameover") {
          handleStart();
        } else if (state.status === "playing") {
          dispatch({ type: "hardDrop" });
        }
      } else if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        if (state.status === "playing") dispatch({ type: "pause" });
        else if (state.status === "paused") dispatch({ type: "resume" });
      } else if (event.key === "Enter" && state.status === "gameover") {
        handleStart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleStart, state.status]);

  useEffect(() => {
    if (state.status !== "playing") return;

    let frame = 0;
    const interval = getDropIntervalMs(state.level);

    const loop = (time: number) => {
      if (time - lastTick.current >= interval) {
        dispatch({ type: "tick" });
        lastTick.current = time;
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [state.level, state.status]);

  return (
    <main className="min-h-screen bg-[#7a8aba] p-4 md:p-8">
      <div className="mx-auto max-w-4xl border-2 border-[#3d4f97] bg-[#dedede] p-4 shadow-[inset_0_1px_0_#ffffff] md:p-6">
        <header className="mb-4 border-b-2 border-[#3d4f97] pb-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#3d4f97]">
                Nintendo 2001 Style
              </p>
              <h1
                className="mt-1 text-4xl font-black text-[#21242e] md:text-5xl"
                style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
              >
                TETRIS
              </h1>
            </div>
            <span className="rounded-sm bg-[#21242e] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#e48600]">
              {statusLabel(state.status)}
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="relative shrink-0">
            <GameBoard state={state} />

            {(state.status === "idle" || state.status === "paused" || state.status === "gameover") && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#21242e]/75 p-4">
                <div className="border border-[#60619c] bg-[#dedede] p-4 text-center shadow-[inset_0_1px_0_#ffffff]">
                  {state.status === "idle" && (
                    <>
                      <p className="text-sm font-bold text-[#21242e]">Ready?</p>
                      <button
                        type="button"
                        onClick={handleStart}
                        className="mt-3 bg-[#ecab37] px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#21242e] hover:bg-[#e48600]"
                      >
                        Start Game
                      </button>
                    </>
                  )}
                  {state.status === "paused" && (
                    <>
                      <p className="text-sm font-bold text-[#21242e]">Paused</p>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "resume" })}
                        className="mt-3 bg-[#ecab37] px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#21242e] hover:bg-[#e48600]"
                      >
                        Resume
                      </button>
                    </>
                  )}
                  {state.status === "gameover" && (
                    <>
                      <p className="text-sm font-bold text-[#e60012]">Game Over</p>
                      <p className="mt-2 text-2xl font-black text-[#21242e]">
                        {state.score.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-[#3d4f97]">
                        {state.lines} lines · Level {state.level}
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        <input
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          maxLength={20}
                          placeholder="Player name"
                          className="border border-[#60619c] bg-white px-2 py-1 text-sm text-[#21242e]"
                        />
                        <button
                          type="button"
                          onClick={handleSaveScore}
                          disabled={saved}
                          className="bg-[#f68d1f] px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-60"
                        >
                          {saved ? "Saved!" : "Save Score"}
                        </button>
                        <button
                          type="button"
                          onClick={handleStart}
                          className="bg-[#ecab37] px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#21242e] hover:bg-[#e48600]"
                        >
                          Play Again
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatBox label="Score" value={state.score.toLocaleString()} accent="#e60012" />
              <StatBox label="Lines" value={String(state.lines)} accent="#3d4f97" />
              <StatBox label="Level" value={String(state.level)} accent="#e48600" />
            </div>

            <MiniBoard type={state.next} label="Next" />

            <section className="border border-[#60619c] bg-white p-3">
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#21242e]">
                Controls
              </h2>
              <ul className="space-y-1 text-xs text-[#3d4f97]">
                <li>← → : Move</li>
                <li>↑ / X : Rotate</li>
                <li>↓ : Soft drop</li>
                <li>Space : Hard drop / Start</li>
                <li>P : Pause</li>
              </ul>
            </section>

            <div className="flex flex-wrap gap-2">
              {(state.status === "idle" || state.status === "gameover") && (
                <ActionButton onClick={handleStart} label="Start" variant="amber" />
              )}
              {state.status === "playing" && (
                <>
                  <ActionButton
                    onClick={() => dispatch({ type: "pause" })}
                    label="Pause"
                    variant="amber"
                  />
                  <ActionButton
                    onClick={() => dispatch({ type: "hardDrop" })}
                    label="Drop"
                    variant="orange"
                  />
                </>
              )}
              {state.status === "paused" && (
                <ActionButton
                  onClick={() => dispatch({ type: "resume" })}
                  label="Resume"
                  variant="amber"
                />
              )}
            </div>

            <section className="border border-[#60619c] bg-white p-3">
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#21242e]">
                Top Scores
              </h2>
              {topScores.length === 0 ? (
                <p className="text-xs text-[#60619c]">아직 기록이 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {topScores.map((entry, index) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between border-b border-[#dedede] pb-2 text-xs last:border-0"
                    >
                      <span className="font-bold text-[#3d4f97]">#{index + 1}</span>
                      <span className="flex-1 px-2 truncate">{entry.player}</span>
                      <span className="font-bold text-[#e60012]">
                        {entry.score.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="border border-[#60619c] bg-[#21242e] p-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9fbee7]">
        {label}
      </p>
      <p className="mt-1 text-lg font-black" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  variant,
}: {
  onClick: () => void;
  label: string;
  variant: "amber" | "orange";
}) {
  const styles =
    variant === "amber"
      ? "bg-[#ecab37] text-[#21242e] hover:bg-[#e48600]"
      : "bg-[#f68d1f] text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wide ${styles}`}
    >
      {label}
    </button>
  );
}
