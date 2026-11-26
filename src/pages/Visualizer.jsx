import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Trophy,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flag,
  BarChart3,
} from "lucide-react";
import { compareAllAlgorithms } from "../utils/diskAlgorithms";
import {
  VALID_ALGOS,
  generateRandomPreset,
  parseRequestQueue,
  validateSimulationInput,
} from "../constants/diskConfig";
import {
  buildLineChartData,
  buildLineChartOptions,
  buildBarChartData,
  buildBarChartOptions,
} from "../utils/chartConfig";
import AmbientPageBackdrop, {
  CARD_SURFACE_CLASSES,
} from "../components/AmbientPageBackdrop";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const EMPTY_RESULT = {
  algorithm: "FCFS",
  sequence: [],
  seekSteps: [],
  thm: 0,
  avgSeek: 0,
};

export default function Visualizer({ isDarkMode = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoParam = searchParams.get("algo");

  const [totalTrack, setTotalTrack] = useState("");
  const [initialHead, setInitialHead] = useState("");
  const [queueInput, setQueueInput] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(
    VALID_ALGOS.includes(algoParam) ? algoParam : "FCFS",
  );
  const [prevAlgoParam, setPrevAlgoParam] = useState(algoParam);

  if (algoParam !== prevAlgoParam) {
    setPrevAlgoParam(algoParam);
    if (algoParam && VALID_ALGOS.includes(algoParam)) {
      setSelectedAlgorithm(algoParam);
    }
  }

  const [hasSimulated, setHasSimulated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [validationError, setValidationError] = useState("");

  const stepListRef = useRef(null);

  const resetSimulationProgress = () => {
    setHasSimulated(false);
    setCurrentStep(0);
    setIsPlaying(false);
    setValidationError("");
  };

  const parsedQueue = useMemo(
    () => parseRequestQueue(queueInput),
    [queueInput],
  );

  const computedAll = useMemo(() => {
    const head = Number(initialHead) || 0;
    const tracks = Number(totalTrack) || 200;
    return compareAllAlgorithms(head, parsedQueue, tracks);
  }, [initialHead, totalTrack, parsedQueue]);

  const currentResult = computedAll[selectedAlgorithm] || EMPTY_RESULT;

  // Status selesai hanya aktif ketika simulasi telah dijalankan dan mencapai langkah terakhir
  const isSimulationCompleted =
    hasSimulated &&
    currentResult.sequence.length > 0 &&
    currentStep >= currentResult.sequence.length - 1;

  const handleLoadSample = () => {
    const preset = generateRandomPreset(initialHead, queueInput);
    setTotalTrack(preset.totalTrack);
    setInitialHead(preset.initialHead);
    setQueueInput(preset.queueInput);
    resetSimulationProgress();
  };

  const handleRunSimulation = () => {
    const errorMsg = validateSimulationInput({
      totalTrack,
      initialHead,
      queue: parsedQueue,
    });

    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setValidationError("");
    setHasSimulated(true);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setTotalTrack("");
    setInitialHead("");
    setQueueInput("");
    setSelectedAlgorithm("FCFS");
    resetSimulationProgress();
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    if (!isPlaying || !hasSimulated) return;

    const delay = 750 / playSpeed;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < currentResult.sequence.length - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, delay);

    return () => clearInterval(timer);
  }, [isPlaying, hasSimulated, playSpeed, currentResult.sequence.length]);

  useEffect(() => {
    if (!hasSimulated || !stepListRef.current) return;
    stepListRef.current.scrollTo({
      top: stepListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentStep, hasSimulated, selectedAlgorithm]);

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) =>
      Math.min(currentResult.sequence.length - 1, prev + 1),
    );
  };

  const handleTogglePlay = () => {
    if (!hasSimulated) {
      handleRunSimulation();
      return;
    }
    if (currentStep >= currentResult.sequence.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const visibleSequence = useMemo(() => {
    if (!hasSimulated) return [];
    return currentResult.sequence.slice(0, currentStep + 1);
  }, [hasSimulated, currentResult.sequence, currentStep]);

  const visiblePoints = useMemo(() => {
    return visibleSequence.map((track, step) => ({
      x: track,
      y: step,
    }));
  }, [visibleSequence]);

  const lineChartData = useMemo(
    () =>
      buildLineChartData(
        visiblePoints,
        currentStep,
        selectedAlgorithm,
        totalTrack,
      ),
    [visiblePoints, currentStep, selectedAlgorithm, totalTrack],
  );

  const lineChartOptions = useMemo(
    () =>
      buildLineChartOptions({
        playSpeed,
        totalTrack,
        sequenceLength: currentResult.sequence.length,
        isDarkMode,
      }),
    [playSpeed, totalTrack, currentResult.sequence.length, isDarkMode],
  );

  const barChartData = useMemo(
    () => buildBarChartData(computedAll, isDarkMode),
    [computedAll, isDarkMode],
  );

  const barChartOptions = useMemo(
    () => buildBarChartOptions(computedAll, isDarkMode),
    [computedAll, isDarkMode],
  );

  const bestAlgo = computedAll.best;

  const formattedAvgSeek = hasSimulated
    ? currentResult.avgSeek % 1 === 0
      ? currentResult.avgSeek
      : currentResult.avgSeek.toFixed(2)
    : 0;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#f8f9fb] text-slate-900 transition-colors duration-300 selection:bg-pink-500 selection:text-white dark:bg-slate-950 dark:text-gray-100">
      <AmbientPageBackdrop variant="visualizer" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Simulasi Disk Scheduling
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Masukkan parameter disk atau gunakan data contoh untuk
              membandingkan efisiensi pergerakan head.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="dm-btn-outline-glow group inline-flex cursor-pointer items-center gap-2 rounded-full border border-pink-300 bg-pink-50 px-4 py-2 text-xs font-semibold text-[#ec008c] hover:-translate-y-0.5 hover:border-[#ec008c] hover:bg-[#fff0f7] active:translate-y-0 dark:border-pink-500/40 dark:bg-pink-500/15 dark:text-pink-300 dark:hover:border-pink-400 dark:hover:bg-pink-500/25 dark:hover:text-pink-100"
          >
            <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            Isi Contoh Data
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/60 dark:text-rose-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* TOP GRID: Control Panel & Head Movement Chart */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT: Control Panel */}
          <section
            className={`flex h-full flex-col justify-between gap-5 rounded-2xl p-5 transition-all duration-300 hover:border-pink-500/40 md:p-6 lg:col-span-5 ${CARD_SURFACE_CLASSES}`}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
                Panel Kontrol
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-gray-300">
                    Total track (0 - N)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={totalTrack}
                    onChange={(e) => {
                      setTotalTrack(e.target.value);
                      resetSimulationProgress();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400/80 hover:border-pink-300 focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-pink-500/40"
                    placeholder="Isi jumlah track"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-gray-300">
                    Posisi awal head
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalTrack ? Number(totalTrack) - 1 : undefined}
                    value={initialHead}
                    onChange={(e) => {
                      setInitialHead(e.target.value);
                      resetSimulationProgress();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400/80 hover:border-pink-300 focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-pink-500/40"
                    placeholder="Isi posisi awal"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-gray-300">
                  Antrean permintaan (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={queueInput}
                  onChange={(e) => {
                    setQueueInput(e.target.value);
                    resetSimulationProgress();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400/80 hover:border-pink-300 focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-pink-500/40"
                  placeholder="Masukkan daftar track, pisahkan dengan koma"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-gray-300">
                  Algoritma
                </label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => {
                    const nextAlgo = e.target.value;
                    setSelectedAlgorithm(nextAlgo);
                    setSearchParams({ algo: nextAlgo }, { replace: true });
                    resetSimulationProgress();
                  }}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition hover:border-pink-300 focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white dark:hover:border-pink-500/40"
                >
                  {VALID_ALGOS.map((algo) => (
                    <option key={algo} value={algo}>
                      {algo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleRunSimulation}
                className="dm-btn-shimmer flex-1 cursor-pointer rounded-xl bg-[#ec008c] px-5 py-3 text-center font-semibold text-white shadow-md shadow-pink-500/25 hover:-translate-y-0.5 hover:bg-[#ff149d] active:translate-y-0"
              >
                Jalankan Simulasi
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="dm-btn-outline-glow cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-600 hover:-translate-y-0.5 hover:border-[#ec008c] hover:bg-[#fff5fa] hover:text-[#ec008c] active:translate-y-0 dark:border-purple-900/60 dark:bg-[#1d163a] dark:text-gray-300 dark:hover:border-pink-400 dark:hover:bg-[#2a1d4f] dark:hover:text-pink-100"
              >
                Reset
              </button>
            </div>
          </section>

          {/* RIGHT: Simulation Chart & Compact THM / Average Seek Time Footer */}
          <section
            className={`flex h-full flex-col justify-between rounded-2xl p-5 transition-all duration-300 hover:border-pink-500/40 md:p-6 lg:col-span-7 ${CARD_SURFACE_CLASSES}`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
                Visualisasi Pergerakan Head
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStepBack}
                  disabled={!hasSimulated || currentStep <= 0}
                  title="Langkah Sebelumnya"
                  className="dm-btn-outline-glow flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-[#ec008c] hover:bg-[#fff5fa] hover:text-[#ec008c] disabled:pointer-events-none disabled:opacity-40 dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300 dark:hover:border-pink-400 dark:hover:bg-[#2b1d52] dark:hover:text-pink-200"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  title={isPlaying ? "Jeda" : "Mulai / Lanjutkan"}
                  className="dm-btn-shimmer flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#ec008c] text-white shadow-md shadow-pink-500/30 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#ff149d] active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStepForward}
                  disabled={
                    !hasSimulated ||
                    currentStep >= currentResult.sequence.length - 1
                  }
                  title="Langkah Berikutnya"
                  className="dm-btn-outline-glow flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-[#ec008c] hover:bg-[#fff5fa] hover:text-[#ec008c] disabled:pointer-events-none disabled:opacity-40 dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300 dark:hover:border-pink-400 dark:hover:bg-[#2b1d52] dark:hover:text-pink-200"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                <select
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(Number(e.target.value))}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:border-pink-300 focus:border-[#ec008c] focus:outline-none dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300 dark:hover:border-pink-500/50"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>

            <div className="min-h-[220px] w-full flex-1">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>

            {/* Compact THM & Average Seek Time Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-slate-200/70 pt-3 text-xs dark:border-purple-900/30">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-slate-500 dark:text-gray-400">
                  Total Head Movement:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {hasSimulated ? currentResult.thm : 0}
                </span>
                <span className="text-slate-400 dark:text-gray-500">track</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-medium text-slate-500 dark:text-gray-400">
                  Average Seek Time:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formattedAvgSeek}
                </span>
                <span className="text-slate-400 dark:text-gray-500">
                  track/req
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM GRID: Progressive Vertical Step Timeline (Left) & All Algorithms Comparison (Right) */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT: Progressive Step-by-Step Timeline / Log List */}
          <section
            className={`flex h-full flex-col justify-between gap-3 rounded-2xl p-5 transition-all duration-300 hover:border-pink-500/40 md:p-6 lg:col-span-5 ${CARD_SURFACE_CLASSES}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
                Urutan Eksekusi ({selectedAlgorithm})
              </h2>
              <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-[#ec008c] dark:bg-pink-500/15 dark:text-pink-300">
                Langkah {hasSimulated ? currentStep : 0} /{" "}
                {hasSimulated ? currentResult.sequence.length - 1 : 0}
              </span>
            </div>

            {hasSimulated ? (
              <div
                ref={stepListRef}
                className="relative max-h-[250px] flex-1 space-y-1.5 overflow-y-auto pr-1"
              >
                {visibleSequence.map((track, idx) => {
                  const isActive = idx === currentStep;
                  const stepDetail =
                    idx > 0 ? currentResult.seekSteps[idx - 1] : null;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStep(idx);
                      }}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                        isActive
                          ? "border-[#ec008c] bg-[#ec008c] text-white shadow-sm shadow-pink-500/30"
                          : "border-pink-200/90 bg-pink-50/70 text-slate-800 hover:border-[#ec008c] hover:bg-pink-50 dark:border-pink-500/25 dark:bg-[#20163d]/90 dark:text-gray-200 dark:hover:border-pink-400 dark:hover:bg-[#2a1d50]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`inline-flex h-6 min-w-[1.75rem] shrink-0 items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-pink-100 text-[#ec008c] dark:bg-pink-500/20 dark:text-pink-300"
                          }`}
                        >
                          {idx === 0 ? "Start" : `#${idx}`}
                        </span>

                        {idx === 0 ? (
                          <div className="flex items-center gap-1.5 truncate text-xs font-semibold">
                            <Flag
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive
                                  ? "text-white"
                                  : "text-sky-500 dark:text-sky-400"
                              }`}
                            />
                            <span className="truncate">
                              Posisi Awal: Track {track}
                            </span>
                          </div>
                        ) : (
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-mono font-semibold">
                              {stepDetail?.from}
                            </span>
                            <ArrowRight
                              className={`h-3 w-3 shrink-0 ${
                                isActive
                                  ? "text-pink-100"
                                  : "text-slate-400 dark:text-gray-500"
                              }`}
                            />
                            <span className="font-mono font-bold">{track}</span>

                            {stepDetail?.isJump && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                }`}
                              >
                                Lompatan
                              </span>
                            )}
                            {stepDetail?.isBoundary && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                                }`}
                              >
                                Batas Disk
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <span
                        className={`ml-2 shrink-0 font-mono text-[11px] font-semibold ${
                          isActive
                            ? "text-white"
                            : "text-[#ec008c] dark:text-pink-300"
                        }`}
                      >
                        {idx === 0
                          ? "0 track"
                          : `+${stepDetail?.distance ?? 0}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/60 p-4 text-center text-xs text-slate-400 dark:border-purple-900/40 dark:bg-[#181230]/50 dark:text-gray-500">
                Jalankan simulasi untuk melihat rincian langkah pergerakan head
                disk.
              </div>
            )}

            <p className="border-t border-slate-200/70 pt-2 text-xs leading-relaxed text-slate-500 dark:border-purple-900/30 dark:text-gray-500">
              Langkah muncul bertahap mengikuti jalannya simulasi. Klik baris
              untuk kembali ke langkah sebelumnya.
            </p>
          </section>

          {/* RIGHT: All Algorithms Comparison Bar Chart (Hanya muncul setelah simulasi selesai) */}
          <section
            className={`flex h-full flex-col justify-between gap-4 rounded-2xl p-5 transition-all duration-300 hover:border-pink-500/40 md:p-6 lg:col-span-7 ${CARD_SURFACE_CLASSES}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
                Perbandingan Semua Algoritma
              </h2>

              {isSimulationCompleted && (
                <div className="flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-xs font-medium text-[#ec008c] transition-transform duration-200 hover:scale-[1.02] dark:border-pink-500/40 dark:bg-[#25133d] dark:text-pink-200">
                  <Trophy className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
                  <span>
                    Best: <strong>{bestAlgo.algorithm}</strong> (THM{" "}
                    <strong>{bestAlgo.thm}</strong>) - hemat{" "}
                    <strong>{computedAll.savingsFromFCFS}%</strong>
                  </span>
                </div>
              )}
            </div>

            {isSimulationCompleted ? (
              <div className="min-h-[220px] w-full flex-1">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            ) : (
              <div className="flex min-h-[220px] w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/60 p-6 text-center dark:border-purple-900/40 dark:bg-[#181230]/50">
                <BarChart3 className="h-7 w-7 text-slate-300 dark:text-purple-500/50" />
                <p className="max-w-xs text-xs leading-relaxed text-slate-400 dark:text-gray-500">
                  {hasSimulated
                    ? "Menunggu proses simulasi selesai untuk menampilkan grafik perbandingan algoritma..."
                    : "Hasil perbandingan semua algoritma akan muncul setelah simulasi selesai dijalankan."}
                </p>
              </div>
            )}

            <p className="border-t border-slate-200/70 pt-2 text-xs leading-relaxed text-slate-500 dark:border-purple-900/30 dark:text-gray-500">
              THM dihitung pada antrean yang sama. Lompatan C-SCAN dari ujung ke
              ujung dihitung sebagai gerakan head.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
