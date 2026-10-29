import React, { useRef, useState } from 'react';
import {
  Plane,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Download,
  Printer,
  RotateCcw,
  ArrowRight,
  BookOpen,
  X,
  Award,
  Sparkles,
  User,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FOLKLORE_STORY } from '../data/questions';
import {
  downloadCertificatePDF,
  downloadCertificateImage,
} from '../utils/certificateGenerator';

// --- START GAME MODAL ---
interface StartModalProps {
  agentName: string;
  agentClass: string;
  setAgentName: (name: string) => void;
  setAgentClass: (className: string) => void;
  onProceedToBriefing: () => void;
  onOpenStory: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({
  agentName,
  agentClass,
  setAgentName,
  setAgentClass,
  onProceedToBriefing,
  onOpenStory,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceedToBriefing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-card max-w-lg w-full rounded-3xl p-5 sm:p-6 text-center shadow-2xl relative overflow-hidden border-2 border-white/80 my-auto">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500" />

        {/* Hero Image: Sang Kancil Piloting Twin-Turbine Airplane over Ocean & Mountains */}
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden mb-3.5 shadow-lg border-2 border-amber-300 group">
          <img
            src="/sang_kancil_pilot.jpg"
            alt="Sang Kancil Juruterbang Misi Rimba"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
            <div className="text-left">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                Kapten Ejen Rimba
              </span>
              <p className="text-white text-xs sm:text-sm font-extrabold font-fredoka drop-shadow">
                Sang Kancil & Pesawat Twin-Turbine
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-800 tracking-tight mb-0.5">
          Misi Rimba ✈️
        </h1>
        <p className="text-amber-700 font-extrabold text-xs sm:text-sm mb-3 uppercase tracking-wider">
          Sang Kancil, Sang Buaya & Sang Kerbau
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="text-left space-y-3 mb-1">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-600" /> Nama Ejen Pelajar
            </label>
            <input
              type="text"
              required
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Contoh: Ejen Ali / Nur Dania"
              className="w-full bg-white border-2 border-amber-300 focus:border-amber-600 focus:outline-none rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 transition shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Kelas / Tingkatan
            </label>
            <input
              type="text"
              required
              value={agentClass}
              onChange={(e) => setAgentClass(e.target.value)}
              placeholder="Contoh: 5 Cerdik / 4 Bijak"
              className="w-full bg-white border-2 border-amber-300 focus:border-amber-600 focus:outline-none rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 transition shadow-sm"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5" /> LANJUT KE TAKLIMAT MISI <ArrowRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenStory}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Ulang Kaji Kisah Dongeng (Hikayat)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MISSION BRIEFING MODAL (TAKLIMAT MISI SEBELUM BERLEPAS) ---
interface BriefingModalProps {
  agentName: string;
  agentClass: string;
  onConfirmLaunch: () => void;
  onBackToRegister: () => void;
  onOpenStory: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  agentName,
  agentClass,
  onConfirmLaunch,
  onBackToRegister,
  onOpenStory,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-card max-w-xl w-full rounded-3xl p-5 sm:p-6 text-left shadow-2xl relative border-2 border-amber-400 my-auto">
        {/* Header Ribbon */}
        <div className="flex items-center gap-3 border-b border-amber-200 pb-3 mb-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-500 shadow shrink-0">
            <img
              src="/sang_kancil_pilot.jpg"
              alt="Kapten Sang Kancil"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Pusat Operasi Udara
              </span>
              <span className="text-emerald-700 font-extrabold text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ejen Disahkan
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-fredoka text-slate-800">
              TAKLIMAT OPERASI: MISI RIMBA ✈️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ejen: <b className="text-slate-800">{agentName || 'Ejen Muda'}</b> · Kelas: <b className="text-slate-800">{agentClass || '5 Cerdik'}</b>
            </p>
          </div>
        </div>

        {/* Briefing Content Cards */}
        <div className="space-y-2.5 text-xs text-slate-700 mb-4 max-h-[58vh] overflow-y-auto pr-1">
          {/* Objective Box */}
          <div className="bg-amber-50/90 rounded-2xl p-3 border border-amber-200/90 space-y-1 shadow-sm">
            <div className="font-black text-amber-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Compass className="w-4 h-4 text-amber-600" /> 1. Objektif & Cabaran Misi:
            </div>
            <p className="leading-relaxed text-slate-600 font-medium pl-5">
              Anda ditugaskan menerbangkan pesawat <b>Twin-Turbine</b> merentasi Lautan Rimba untuk menyelesaikan <b>10 soalan pemahaman</b> kisah <i>&ldquo;Sang Kancil, Sang Buaya & Sang Kerbau&rdquo;</i> yang dibahagikan kepada 3 Tahap (Mudah, Sederhana & Sukar).
            </p>
          </div>

          {/* Procedure Box */}
          <div className="bg-cyan-50/90 rounded-2xl p-3 border border-cyan-200/90 space-y-1 shadow-sm">
            <div className="font-black text-cyan-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Plane className="w-4 h-4 text-cyan-600" /> 2. Prosedur Melalui Gegelung:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-5">
              <li>Baca soalan pada reben atas skrin dan teliti 4 kad pilihan pada dok bawah.</li>
              <li>Setiap jawapan diwakili oleh <b>Gegelung Bersuara (A, B, C, D)</b> bercahaya di hadapan.</li>
              <li>Pandu pesawat anda menembusi gegelung dengan huruf jawapan yang betul!</li>
            </ul>
          </div>

          {/* Hazard Alert Box */}
          <div className="bg-rose-50/90 rounded-2xl p-3 border border-rose-200/90 space-y-1 shadow-sm">
            <div className="font-black text-rose-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> 3. Amaran Pertahanan & Asap Kerosakan:
            </div>
            <p className="leading-relaxed text-slate-600 font-medium pl-5">
              <b className="text-rose-700">Awas Tembakan Meriam!</b> Memilih gegelung salah akan menyebabkan pesawat ditembak meriam pertahanan dan kehilangan 1 nyawa. Enjin akan mengeluarkan <b>asap kerosakan kelabu hingga hitam pekat</b> sekiranya terkena tembakan berulang kali!
            </p>
          </div>

          {/* Controls Quick Reference Box */}
          <div className="bg-slate-900 rounded-2xl p-3 text-white space-y-1.5 shadow-sm border border-slate-700">
            <div className="font-bold text-amber-300 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Panduan Kemudi Pantas:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <b className="text-white">Papan Kekunci:</b> <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 border border-slate-700">← A</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 border border-slate-700">D →</kbd> Kiri/Kanan
              </div>
              <div>
                <b className="text-white">Altitud:</b> <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 border border-slate-700">↑ W</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 border border-slate-700">↓ S</kbd> Naik/Turun
              </div>
              <div className="col-span-2">
                <b className="text-white">Tetikus / Skrin Sentuh:</b> Seret di mana-mana ruang skrin untuk mengemudi secara langsung.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <button
            onClick={onConfirmLaunch}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plane className="w-5 h-5" /> TERIMA TAKLIMAT & MULA LEPAS LANDAS 🚀
          </button>

          <div className="flex gap-2">
            <button
              onClick={onBackToRegister}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tukar Nama / Kelas
            </button>
            <button
              onClick={onOpenStory}
              className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Baca Hikayat Penuh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STAGE PASS MODAL ---
interface StagePassModalProps {
  stage: number;
  onNextStage: () => void;
}

export const StagePassModal: React.FC<StagePassModalProps> = ({
  stage,
  onNextStage,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 md:p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-fredoka text-slate-800 mb-2">
          TAHAP {stage} SELESAI!
        </h2>
        <p className="text-emerald-700 font-extrabold text-sm mb-6">
          {stage === 1
            ? 'Syabas! Anda melepasi kesemua soalan Asas (1-6). Sedia untuk Tahap 2: Sederhana (Analisis Watak)?'
            : 'Hebat! Anda melepasi soalan Analisis (7-8). Sedia untuk Tahap 3: Sukar (KBAT & Nilai Murni)?'}
        </p>

        <button
          onClick={onNextStage}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition text-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          TERUSKAN PENERBANGAN <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- GAME OVER MODAL ---
interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 md:p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-fredoka text-slate-800 mb-2">
          MISI GAGAL! 💥
        </h2>
        <p className="text-slate-600 text-sm mb-3">
          Pesawat telah ditembak meriam kerana berulang kali memilih jawapan yang tidak tepat.
        </p>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-6">
          <span className="text-xs text-slate-500 font-bold block">SKOR TERCAPAI:</span>
          <span className="text-2xl font-black text-rose-600 font-fredoka">{score} MATA</span>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition text-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" /> CUBA LAGI DARI AWAL
        </button>
      </div>
    </div>
  );
};

// --- VICTORY & OFFICIAL CERTIFICATE MODAL ---
interface VictoryModalProps {
  agentName: string;
  agentClass: string;
  score: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  agentName,
  agentClass,
  score,
  onPlayAgain,
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // ignore
    }
  }, []);

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${today.getFullYear()}`;

  const downloadPDFHandler = async () => {
    try {
      setIsExporting(true);
      await downloadCertificatePDF(agentName, agentClass, score, dateStr);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      await downloadCertificateImage(agentName, agentClass, score, dateStr);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadImageHandler = async () => {
    try {
      setIsExporting(true);
      await downloadCertificateImage(agentName, agentClass, score, dateStr);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      <div className="glass-card max-w-2xl w-full rounded-3xl p-5 md:p-6 text-center shadow-2xl my-auto">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-950 text-3xl shadow-lg">
          <Trophy className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black font-fredoka text-slate-800 mb-0.5">
          TAHNIAH! MISI TAMAT DENGAN CEMERLANG! 🏆
        </h2>
        <p className="text-amber-700 font-extrabold text-xs uppercase tracking-widest mb-3.5">
          Wira Kebijaksanaan Rimba
        </p>

        {/* CERTIFICATE TEMPLATE CONTAINER */}
        <div
          id="certificate-template"
          ref={certRef}
          className="bg-gradient-to-b from-amber-50 via-yellow-50/50 to-orange-50/70 p-5 md:p-6 rounded-2xl border-4 border-double border-amber-500 shadow-inner text-center relative overflow-hidden mb-4 select-text"
        >
          {/* Subtle Watermark Badge */}
          <Award className="absolute -right-6 -bottom-6 w-36 h-36 text-amber-200/30 pointer-events-none" />

          {/* Mini Pilot Emblem */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/sang_kancil_pilot.jpg"
              alt="Sang Kancil"
              className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover shadow"
            />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                AKADEMI PENERBANGAN MISI RIMBA
              </span>
              <span className="text-[9px] text-slate-600 block">
                Pentauliahan Kecekapan & Pemahaman Cerita Rakyat
              </span>
            </div>
          </div>

          <h3
            className="text-lg md:text-xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            SIJIL PENERBANGAN & KEBIJAKSANAAN
          </h3>
          <p className="text-[10px] text-slate-500 italic mb-2">
            Dengan ini disahkan bahawa
          </p>

          <div className="text-lg md:text-2xl font-black text-amber-800 underline decoration-amber-400 decoration-2 mb-0.5 font-fredoka">
            {agentName.toUpperCase() || 'EJEN MUDA'}
          </div>
          <div className="text-xs font-bold text-slate-600 mb-3">
            KELAS: {agentClass.toUpperCase() || '5 CERDIK'}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto mb-3.5 font-medium">
            Telah berjaya menyempurnakan penerbangan <b>Misi Rimba</b> serta menjawab kesemua 10 soalan pemahaman cerita{' '}
            <i>&ldquo;Sang Kancil, Sang Buaya dan Sang Kerbau&rdquo;</i> dengan cemerlang dan bijaksana.
          </p>

          {/* Score & Date Grid */}
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left bg-white/90 p-2.5 rounded-xl border border-amber-300 text-xs mb-3 shadow-sm">
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase">
                JUMLAH SKOR:
              </span>
              <strong className="text-amber-700 text-sm font-black font-fredoka">
                {score} MATA
              </strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase">
                TARIKH PENCAPAIAN:
              </span>
              <strong className="text-slate-800 font-bold text-xs">{dateStr}</strong>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end text-[10px] text-slate-600 pt-2 border-t border-amber-300/80">
            <div className="text-left">
              <p className="font-extrabold text-slate-800 text-[10px]">AKADEMI PENERBANGAN</p>
              <p className="text-[9px] text-slate-500">Sistem Misi Rimba Interaktif</p>
            </div>
            <div className="text-right">
              <p
                className="font-bold text-amber-900 italic text-xs"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Sang Kancil
              </p>
              <p className="text-[9px] text-slate-500">Penaung Kebijaksanaan Rimba</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={downloadPDFHandler}
            disabled={isExporting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-2.5 px-3 rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Muat turun fail sijil PDF resolusi tinggi"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isExporting ? 'Menjana...' : 'Sijil PDF'}</span>
          </button>

          <button
            onClick={downloadImageHandler}
            disabled={isExporting}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black py-2.5 px-3 rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Muat turun fail gambar PNG segera"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Imej PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl shadow transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            title="Cetak atau simpan melalui pelayar"
          >
            <Printer className="w-4 h-4 shrink-0" /> Cetak
          </button>

          <button
            onClick={onPlayAgain}
            className="bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 px-3 rounded-xl shadow transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0" /> Main Semula
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STORY / HIKAYAT POPUP MODAL ---
interface StoryModalProps {
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-xl w-full rounded-3xl p-6 text-left shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base font-fredoka">
                {FOLKLORE_STORY.title}
              </h3>
              <p className="text-[11px] text-amber-700 font-bold uppercase">
                Cerita Rakyat & Pengajaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed pr-1">
          {/* Story Illustration Header */}
          <div className="relative w-full h-36 rounded-xl overflow-hidden shadow border border-amber-200">
            <img
              src="/sang_kancil_pilot.jpg"
              alt="Sang Kancil"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
            <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
              Sinopsis Cerita
            </h4>
            <div className="whitespace-pre-line text-slate-700 leading-relaxed font-outfit">
              {FOLKLORE_STORY.synopsis}
            </div>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
            <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Nilai Murni & Pengajaran Utama
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
              {FOLKLORE_STORY.moralValues.map((val, idx) => (
                <li key={idx} className="font-medium">
                  {val}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition cursor-pointer"
          >
            Faham, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
