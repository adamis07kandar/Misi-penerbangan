import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowUpDown,
  ArrowLeftRight,
  BookOpen,
  Heart,
  Star,
  Compass,
  Plane,
  RotateCcw,
  ShieldAlert,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Question, QuestionOptionKey } from '../types/game';

interface GameHUDProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  lives: number;
  maxLives: number;
  invertY: boolean;
  invertX: boolean;
  soundMuted: boolean;
  isHit: boolean;
  isTakingOff: boolean;
  isLanding?: boolean;
  telemetry?: { altitude: number; speed: number; heading: number };
  onToggleInvertY: () => void;
  onToggleInvertX: () => void;
  onToggleSound: () => void;
  onOpenStory: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  score,
  lives,
  maxLives,
  invertY,
  invertX,
  soundMuted,
  isHit,
  isTakingOff,
  isLanding = false,
  telemetry,
  onToggleInvertY,
  onToggleInvertX,
  onToggleSound,
  onOpenStory,
  onRestart,
}) => {
  const [showOptionsDock, setShowOptionsDock] = useState(true);

  const stageNumber = currentQuestion.stage;
  const isStage3 = stageNumber === 3;
  const questionsInCurrentStage = stageNumber === 1 ? 6 : 2;
  const stageQuestionIndex =
    stageNumber === 1
      ? questionIndex + 1
      : stageNumber === 2
      ? questionIndex - 5
      : questionIndex - 7;

  const OPTION_COLORS: Record<QuestionOptionKey, { badge: string; border: string; bg: string }> = {
    A: { badge: 'bg-amber-500 text-slate-950', border: 'border-amber-400/50', bg: 'bg-amber-950/40' },
    B: { badge: 'bg-cyan-500 text-slate-950', border: 'border-cyan-400/50', bg: 'bg-cyan-950/40' },
    C: { badge: 'bg-emerald-500 text-slate-950', border: 'border-emerald-400/50', bg: 'bg-emerald-950/40' },
    D: { badge: 'bg-purple-500 text-white', border: 'border-purple-400/50', bg: 'bg-purple-950/40' },
  };

  return (
    <div className="relative z-10 w-full h-screen pointer-events-none flex flex-col justify-between p-2.5 sm:p-4 select-none">
      {/* ================= TOP SECTION: ULTRA-SLIM HUD ================= */}
      {/* Kept ultra-compact so the sky and approaching rings are 100% visible */}
      <div className="w-full max-w-5xl mx-auto space-y-1.5 pointer-events-auto">
        {/* Top Status Bar */}
        <div className="flex justify-between items-center gap-2">
          {/* Stage & Question Tracker */}
          <div className="glass-panel text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-2xl shadow-xl flex items-center gap-2">
            <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-xl overflow-hidden border border-amber-400 shadow shrink-0">
              <img
                src="/sang_kancil_pilot.jpg"
                alt="Ejen Sang Kancil"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                {currentQuestion.stageTitle}
              </div>
              <div className="text-xs font-extrabold text-white">
                Soalan {stageQuestionIndex}/{questionsInCurrentStage}{' '}
                <span className="text-slate-400 font-medium text-[10px] hidden sm:inline">
                  (Jumlah {questionIndex + 1}/{totalQuestions})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Utility Toggles */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Steering Left/Right Mode Toggle */}
            <button
              onClick={onToggleInvertX}
              className={`text-[10px] sm:text-xs px-2 py-1 rounded-xl border flex items-center gap-1 font-semibold transition shadow active:scale-95 cursor-pointer ${
                invertX
                  ? 'bg-rose-950/80 text-rose-200 border-rose-400/50'
                  : 'bg-slate-900/80 text-slate-200 border-amber-400/30 hover:bg-slate-800'
              }`}
              title="Tukar arah kemudi kiri/kanan (Pintasan: X)"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">
                {invertX ? 'Kemudi: Terbalik' : 'Kemudi: Normal'}
              </span>
            </button>

            {/* Pitch Elevator Toggle */}
            <button
              onClick={onToggleInvertY}
              className={`text-[10px] sm:text-xs px-2 py-1 rounded-xl border flex items-center gap-1 font-semibold transition shadow active:scale-95 cursor-pointer ${
                invertY
                  ? 'bg-rose-950/80 text-rose-200 border-rose-400/50'
                  : 'bg-slate-900/80 text-slate-200 border-amber-400/30 hover:bg-slate-800'
              }`}
              title="Tukar mod kawalan paksi-Y (Pintasan: Y)"
            >
              <ArrowUpDown className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">
                {invertY ? 'Paksi-Y: Terbalik' : 'Paksi-Y: Normal'}
              </span>
            </button>

            {/* Toggle Dock Visibility Button */}
            <button
              onClick={() => setShowOptionsDock(!showOptionsDock)}
              className="text-amber-300 hover:text-white text-[10px] sm:text-xs bg-slate-900/85 hover:bg-slate-800 px-2 py-1 rounded-xl border border-amber-400/40 flex items-center gap-1 font-bold transition shadow cursor-pointer"
              title="Papar atau sembunyikan kad jawapan di bawah"
            >
              {showOptionsDock ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Sembunyi Pilihan</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Papar Pilihan</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="text-slate-200 hover:text-white text-xs bg-slate-900/80 hover:bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow transition active:scale-95 cursor-pointer"
              title={soundMuted ? 'Nyahbisu Bunyi' : 'Bisu Bunyi'}
            >
              {soundMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Story Button */}
            <button
              onClick={onOpenStory}
              className="text-amber-200 hover:text-white text-[10px] sm:text-xs bg-amber-950/70 hover:bg-amber-900/80 px-2 py-1 rounded-xl border border-amber-500/40 flex items-center gap-1 font-bold transition shadow active:scale-95 cursor-pointer"
              title="Baca ringkasan cerita Sang Kancil"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Hikayat</span>
            </button>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="text-slate-300 hover:text-white text-xs bg-slate-900/80 hover:bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow transition active:scale-95 cursor-pointer"
              title="Mulakan semula penerbangan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>

          {/* Score & Lives */}
          <div className="glass-panel text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[8px] uppercase text-slate-300 font-bold">Mata</div>
                <div className="text-xs sm:text-sm font-black text-amber-300 tabular-nums leading-none">
                  {score}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <div>
                <div className="text-[8px] uppercase text-slate-300 font-bold">Nyawa</div>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: maxLives }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-3 h-3 ${
                        i < lives
                          ? 'text-rose-500 fill-rose-500'
                          : 'text-slate-600 fill-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAKEOFF CINEMATIC OVERLAY */}
        {isTakingOff ? (
          <div className="w-full animate-in zoom-in-95 duration-200">
            <div className="glass-panel rounded-2xl p-2.5 sm:p-3 text-white shadow-xl border-2 border-amber-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-xs sm:text-sm font-fredoka uppercase tracking-wider">
                <Plane className="w-4 h-4 text-amber-400 animate-pulse" />
                MELUNCUR LEPAS LANDAS... ENJIN KUASA MAKSIMUM!
              </div>
              <p className="text-[11px] text-slate-200">
                Kapten Sang Kancil: <i>&ldquo;Pegang kemudi kukuh-kukuh! Kita sedia berlepas!&rdquo;</i>
              </p>
            </div>
          </div>
        ) : isLanding ? (
          /* LANDING CINEMATIC OVERLAY */
          <div className="w-full animate-in zoom-in-95 duration-200">
            <div className="glass-panel rounded-2xl p-2.5 sm:p-3 text-white shadow-xl border-2 border-emerald-400 text-center space-y-1 bg-emerald-950/80">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-xs sm:text-sm font-fredoka uppercase tracking-wider">
                <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
                TAHNIAH! KESEMUA SOALAN BERJAYA! 🛬
              </div>
              <p className="text-[11px] text-emerald-100 font-bold">
                Kapten Sang Kancil: <i>&ldquo;Pendaratan cemerlang di Pulau Akademi Misi Rimba!&rdquo;</i>
              </p>
            </div>
          </div>
        ) : (
          /* SLIM COMPACT QUESTION RIBBON AT TOP (DOES NOT OCCLUDE RINGS!) */
          <div className="w-full transition-all duration-300">
            <div className="glass-panel rounded-xl px-3 py-1.5 sm:py-2 text-white shadow-lg border border-amber-400/40 flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-amber-100 leading-tight truncate font-outfit">
                <span className="text-amber-400 font-black mr-1">#{currentQuestion.id}.</span>
                {currentQuestion.text}
              </h2>
              {telemetry && (
                <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 font-mono shrink-0 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-700/50">
                  <span>ALT: {telemetry.altitude}m</span>
                  <span>SPD: {telemetry.speed}km/h</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BATTLE DAMAGE WARNING */}
        {isHit && (
          <div className="w-full animate-in zoom-in-95 duration-100 pointer-events-none">
            <div className="bg-rose-900/95 border-2 border-rose-500 text-white rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 shadow-xl text-xs font-black">
              <ShieldAlert className="w-4 h-4 text-rose-300 animate-bounce" />
              <span>💥 AWAS! PESAWAT DITEMBAK MERIAM KERANA JAWAPAN SALAH! (-1 NYAWA)</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= 100% UNOBSTRUCTED FLIGHT VIEWPORT ================= */}
      {/* Center of the screen is completely open so approaching rings are 100% visible from distance */}
      <div className="flex-1 pointer-events-none" />

      {/* ================= BOTTOM SECTION: OPTIONS DOCK & CONTROLS ================= */}
      {/* Placed at the bottom over the sea/water so the sky/rings remain 100% clear! */}
      <div className="w-full max-w-5xl mx-auto space-y-2 pointer-events-auto pb-1">
        {/* EXPANDABLE/COLLAPSIBLE OPTIONS DOCK AT BOTTOM */}
        {!isTakingOff && !isLanding && showOptionsDock && (
          <div className="w-full animate-in slide-in-from-bottom-2 duration-200">
            <div className="glass-panel rounded-2xl p-2.5 sm:p-3 text-white shadow-2xl border border-amber-400/40">
              {/* Question Text displayed clearly on top of options */}
              <div className="text-[11px] sm:text-xs font-bold text-amber-300 mb-2 flex items-center justify-between border-b border-white/10 pb-1">
                <span>
                  <span className="text-white font-extrabold mr-1">Pilihan Jawapan:</span> Terbangkan pesawat melepasi gegelung yang betul
                </span>
                <button
                  onClick={() => setShowOptionsDock(false)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Sembunyikan kad pilihan"
                >
                  <ChevronDown className="w-3 h-3" /> Sembunyi
                </button>
              </div>

              {/* 4 Options Grid (Full text, 100% readable without truncation) */}
              <div
                className={`grid gap-1.5 sm:gap-2 ${
                  isStage3
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-2 md:grid-cols-4'
                }`}
              >
                {(['A', 'B', 'C', 'D'] as QuestionOptionKey[]).map((key) => {
                  const optColor = OPTION_COLORS[key];
                  return (
                    <div
                      key={key}
                      className={`bg-slate-900/90 rounded-xl p-2 sm:p-2.5 text-xs flex items-start gap-2 border ${optColor.border} shadow-sm hover:border-amber-400 transition`}
                    >
                      <span
                        className={`${optColor.badge} font-black px-2 py-0.5 rounded-md shrink-0 text-xs shadow-sm`}
                      >
                        {key}
                      </span>
                      {/* FULL UNABRIDGED TEXT */}
                      <span className="text-slate-100 font-semibold leading-snug break-words flex-1">
                        {currentQuestion.options[key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Minimal Bottom Bar: Keyboard Hints & Mobile Steering */}
        <div className="w-full flex justify-between items-center text-xs">
          {/* Desktop Controls */}
          <div className="hidden md:flex glass-panel px-3 py-1.5 rounded-xl text-white text-[11px] gap-2.5 items-center shadow">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Kawalan:
            </span>
            <span className="text-slate-300">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-[10px] font-mono text-amber-300">
                ← A
              </kbd>{' '}
              Kiri
            </span>
            <span className="text-slate-300">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-[10px] font-mono text-amber-300">
                D →
              </kbd>{' '}
              Kanan
            </span>
            <span className="text-slate-300">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-[10px] font-mono text-amber-300">
                ↑ W
              </kbd>{' '}
              {invertY ? 'Turun' : 'Naik'}
            </span>
            <span className="text-slate-300">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-[10px] font-mono text-amber-300">
                ↓ S
              </kbd>{' '}
              {invertY ? 'Naik' : 'Turun'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">
              Pintasan:{' '}
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300">
                1-4 / A-D
              </kbd>
            </span>
          </div>

          {/* If Options Dock is Hidden, show quick button to open */}
          {!showOptionsDock && (
            <button
              onClick={() => setShowOptionsDock(true)}
              className="glass-panel px-3 py-1.5 rounded-xl text-amber-300 hover:text-white text-xs flex items-center gap-1.5 shadow font-bold cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" /> Papar Pilihan Jawapan (A, B, C, D)
            </button>
          )}

          {/* Mobile Instruction */}
          <div className="md:hidden glass-panel px-2.5 py-1 rounded-xl text-white text-[10px] flex items-center gap-1 shadow ml-auto">
            <Plane className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Seret skrin untuk kemudi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
