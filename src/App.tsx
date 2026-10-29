/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { FlightCanvas } from './components/FlightCanvas';
import { GameHUD } from './components/GameHUD';
import {
  StartModal,
  BriefingModal,
  StagePassModal,
  GameOverModal,
  VictoryModal,
  StoryModal,
} from './components/Modals';
import { QUESTIONS } from './data/questions';
import { GameStatus, QuestionOptionKey } from './types/game';
import { soundManager } from './audio/synth';

export default function App() {
  const [gameState, setGameState] = useState<GameStatus>('START');
  const [agentName, setAgentName] = useState<string>('Ejen Ali');
  const [agentClass, setAgentClass] = useState<string>('5 Cerdik');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [invertY, setInvertY] = useState<boolean>(false);
  const [invertX, setInvertX] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [storyOpen, setStoryOpen] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState({ altitude: 420, speed: 170, heading: 90 });
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);
  const [shotEffectTrigger, setShotEffectTrigger] = useState<number>(0);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [isTakingOff, setIsTakingOff] = useState<boolean>(false);
  const [isLanding, setIsLanding] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex] || QUESTIONS[0];
  const maxLives = 3;

  const handleToggleSound = useCallback(() => {
    const isMuted = soundManager.toggleMute();
    setSoundMuted(isMuted);
  }, []);

  const handleToggleInvertY = useCallback(() => {
    setInvertY((prev) => !prev);
  }, []);

  const handleToggleInvertX = useCallback(() => {
    setInvertX((prev) => !prev);
  }, []);

  const handleProceedToBriefing = useCallback(() => {
    soundManager.playButtonClick();
    setGameState('BRIEFING');
  }, []);

  const handleBackToRegister = useCallback(() => {
    soundManager.playButtonClick();
    setGameState('START');
  }, []);

  const handleStartGame = useCallback(() => {
    soundManager.startEngine();
    soundManager.playButtonClick();
    setIsTakingOff(true);
    setIsLanding(false);
    setGameState('PLAYING');
  }, []);

  const handleTakeoffComplete = useCallback(() => {
    setIsTakingOff(false);
  }, []);

  const handleLandingComplete = useCallback(() => {
    setIsLanding(false);
    soundManager.stopEngine();
    soundManager.playVictory();
    setGameState('VICTORY');
  }, []);

  const handleGatePass = useCallback(
    (chosenLetter: QuestionOptionKey) => {
      if (isTakingOff || isLanding) return;
      const q = QUESTIONS[currentQuestionIndex];
      if (!q) return;

      if (chosenLetter === q.answer) {
        // Correct Gate!
        soundManager.playCorrect();
        setScore((prev) => prev + 100);
        setFeedbackFlash('correct');
        setTimeout(() => setFeedbackFlash(null), 800);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex >= QUESTIONS.length) {
          setIsLanding(true);
        } else if (QUESTIONS[nextIndex].stage > q.stage) {
          soundManager.playStageClear();
          setCurrentQuestionIndex(nextIndex);
          setGameState('STAGE_PASS');
        } else {
          setCurrentQuestionIndex(nextIndex);
        }
      } else {
        // Wrong Gate! -> PESAWAT DITEMBAK MERIAM
        setShotEffectTrigger((prev) => prev + 1);
        setIsHit(true);
        setTimeout(() => setIsHit(false), 1200);

        setFeedbackFlash('wrong');
        setTimeout(() => setFeedbackFlash(null), 900);

        setLives((prev) => {
          const updatedLives = prev - 1;
          if (updatedLives <= 0) {
            setTimeout(() => {
              soundManager.stopEngine();
              setGameState('GAMEOVER');
            }, 600);
          }
          return Math.max(0, updatedLives);
        });
      }
    },
    [currentQuestionIndex, isTakingOff, isLanding]
  );

  const handleGateMiss = useCallback(() => {
    // Smooth reset if passed through without hitting any gate
  }, []);

  const handleNextStage = useCallback(() => {
    soundManager.playButtonClick();
    setGameState('PLAYING');
  }, []);

  const handleRestart = useCallback(() => {
    soundManager.playButtonClick();
    soundManager.startEngine();
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setIsLanding(false);
    setIsTakingOff(true);
    setGameState('PLAYING');
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (gameState === 'START' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleProceedToBriefing();
      } else if (gameState === 'BRIEFING' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStartGame();
      } else if (e.key.toLowerCase() === 'x') {
        handleToggleInvertX();
      } else if (e.key.toLowerCase() === 'y') {
        handleToggleInvertY();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleSound();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, handleProceedToBriefing, handleStartGame, handleToggleInvertX, handleToggleInvertY, handleToggleSound]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-sky-950 font-outfit select-none">
      {/* 3D Flight Canvas */}
      <FlightCanvas
        currentQuestion={currentQuestion}
        gameState={gameState}
        lives={lives}
        invertY={invertY}
        invertX={invertX}
        shotEffectTrigger={shotEffectTrigger}
        isTakingOff={isTakingOff}
        isLanding={isLanding}
        onTakeoffComplete={handleTakeoffComplete}
        onLandingComplete={handleLandingComplete}
        onGatePass={handleGatePass}
        onGateMiss={handleGateMiss}
        setPlaneTelemetry={setTelemetry}
      />

      {/* Screen Hit Flash Effect */}
      {feedbackFlash && (
        <div
          className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
            feedbackFlash === 'correct'
              ? 'ring-8 ring-inset ring-emerald-400 bg-emerald-500/10'
              : 'ring-8 ring-inset ring-rose-500 bg-rose-500/25 animate-pulse'
          }`}
        />
      )}

      {/* Floating Feedback Banner */}
      {feedbackFlash && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in zoom-in-95 duration-150">
          <div
            className={`px-5 py-2.5 rounded-2xl font-black text-sm md:text-base shadow-2xl flex items-center gap-2 border-2 ${
              feedbackFlash === 'correct'
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-rose-600 text-white border-rose-300 animate-bounce'
            }`}
          >
            {feedbackFlash === 'correct'
              ? '✅ TEPAT! +100 MATA'
              : '💥 DITEMBAK! JAWAPAN SALAH (-1 NYAWA)'}
          </div>
        </div>
      )}

      {/* HUD Overlay (visible when playing, taking off, or landing) */}
      {(gameState === 'PLAYING' || isTakingOff || isLanding) && (
        <GameHUD
          currentQuestion={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={QUESTIONS.length}
          score={score}
          lives={lives}
          maxLives={maxLives}
          invertY={invertY}
          invertX={invertX}
          soundMuted={soundMuted}
          isHit={isHit}
          isTakingOff={isTakingOff}
          isLanding={isLanding}
          telemetry={telemetry}
          onToggleInvertY={handleToggleInvertY}
          onToggleInvertX={handleToggleInvertX}
          onToggleSound={handleToggleSound}
          onOpenStory={() => setStoryOpen(true)}
          onRestart={handleRestart}
        />
      )}

      {/* Modals & Dialogs */}
      {gameState === 'START' && (
        <StartModal
          agentName={agentName}
          agentClass={agentClass}
          setAgentName={setAgentName}
          setAgentClass={setAgentClass}
          onProceedToBriefing={handleProceedToBriefing}
          onOpenStory={() => setStoryOpen(true)}
        />
      )}

      {gameState === 'BRIEFING' && (
        <BriefingModal
          agentName={agentName}
          agentClass={agentClass}
          onConfirmLaunch={handleStartGame}
          onBackToRegister={handleBackToRegister}
          onOpenStory={() => setStoryOpen(true)}
        />
      )}

      {gameState === 'STAGE_PASS' && (
        <StagePassModal
          stage={QUESTIONS[currentQuestionIndex].stage - 1}
          onNextStage={handleNextStage}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal score={score} onRestart={handleRestart} />
      )}

      {gameState === 'VICTORY' && (
        <VictoryModal
          agentName={agentName}
          agentClass={agentClass}
          score={score}
          onPlayAgain={handleRestart}
        />
      )}

      {storyOpen && <StoryModal onClose={() => setStoryOpen(false)} />}
    </main>
  );
}
