import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import {
  ALGORITHM_DESCRIPTIONS,
  compareAllAlgorithms,
} from "../utils/diskAlgorithms";
import {
  VALID_ALGOS,
  DEFAULT_PRESET,
  parseRequestQueue,
  validateSimulationInput,
} from "../constants/diskConfig";
import {
  buildLineChartData,
  buildLineChartOptions,
  buildBarChartData,
  buildBarChartOptions,
} from "../utils/chartConfig";

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

export default function Visualizer({ isDarkMode = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoParam = searchParams.get("algo");

  const [totalTrack, setTotalTrack] = useState("");
  const [initialHead, setInitialHead] = useState("");
  const [queueInput, setQueueInput] = useState("");
  const [direction, setDirection] = useState("right");
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

  const parsedQueue = useMemo(
    () => parseRequestQueue(queueInput),
    [queueInput],
  );

  const computedAll = useMemo(() => {
    const head = Number(initialHead) || 0;
    const tracks = Number(totalTrack) || 200;
    return compareAllAlgorithms(head, parsedQueue, tracks, direction);
  }, [initialHead, totalTrack, parsedQueue, direction]);

  const currentResult = computedAll[selectedAlgorithm];

  const handleLoadSample = () => {
    setTotalTrack(DEFAULT_PRESET.totalTrack);
    setInitialHead(DEFAULT_PRESET.initialHead);
    setQueueInput(DEFAULT_PRESET.queueInput);
    setDirection(DEFAULT_PRESET.direction);
    setValidationError("");
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
    setDirection("right");
    setSelectedAlgorithm("FCFS");
    setHasSimulated(false);
    setCurrentStep(0);
    setIsPlaying(false);
    setValidationError("");
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    if (!isPlaying || !hasSimulated) return;

    const delay = 700 / playSpeed;
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

  const visiblePoints = useMemo(() => {
    if (!hasSimulated) return [];
    return currentResult.sequence
      .slice(0, currentStep + 1)
      .map((track, step) => ({
        x: track,
        y: step,
      }));
  }, [hasSimulated, currentResult.sequence, currentStep]);

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
        isPlaying,
        totalTrack,
        sequenceLength: currentResult?.sequence?.length,
        isDarkMode,
      }),
    [isPlaying, totalTrack, currentResult?.sequence?.length, isDarkMode],
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

  const getStatusMessage = () => {
    if (!hasSimulated) return "Tekan Jalankan Simulasi untuk memulai.";
    if (currentStep === 0)
      return `Head berada di posisi awal track ${initialHead}.`;

    const stepInfo = currentResult.seekSteps[currentStep - 1];
    if (!stepInfo) return "Simulasi selesai.";

    if (stepInfo.isJump) {
      return `Langkah ${currentStep}: Lompatan C-SCAN dari ujung track ${stepInfo.from} ke track ${stepInfo.to} (Jarak lompatan: ${stepInfo.distance} track).`;
    }
    if (stepInfo.isBoundary) {
      return `Langkah ${currentStep}: Head mencapai batas disk di track ${stepInfo.to} (Jarak: ${stepInfo.distance} track).`;
    }
    return `Langkah ${currentStep}: Head berpindah dari track ${stepInfo.from} ke ${stepInfo.to} (Jarak pencarian: ${stepInfo.distance} track).`;
  };

  return (
    <div className="relative overflow-x-hidden bg-[#f8f9fb] text-slate-900 transition-colors duration-300 selection:bg-pink-500 selection:text-white dark:bg-[#0b0816] dark:text-gray-100">
      {/* Ambient glow backdrop (Dark mode) */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block">
        <div className="absolute top-[-5%] left-[25%] h-[500px] w-[600px] rounded-full bg-pink-600/10 blur-[140px]" />
        <div className="absolute top-[35%] right-[10%] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[450px] w-[650px] rounded-full bg-pink-500/10 blur-[150px]" />
      </div>

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
            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-xs font-semibold text-[#ec008c] transition hover:bg-pink-100 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
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

        {/* Top Grid: Control Panel & Head Movement Chart */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT: Control Panel */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-pink-500/20 dark:bg-[#140e29]/85 dark:shadow-[0_0_25px_rgba(236,72,153,0.08)] md:p-6 lg:col-span-5">
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
                  onChange={(e) => setTotalTrack(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white"
                  placeholder="200"
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
                  onChange={(e) => setInitialHead(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white"
                  placeholder="53"
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
                onChange={(e) => setQueueInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white"
                placeholder="98, 183, 37, 122, 14, 124, 65, 67"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-gray-300">
                Arah awal
              </label>
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="direction"
                    value="right"
                    checked={direction === "right"}
                    onChange={() => setDirection("right")}
                    className="h-4 w-4 cursor-pointer accent-[#ec008c]"
                  />
                  <span>
                    Kanan (ke {Math.max(0, (Number(totalTrack) || 200) - 1)})
                  </span>
                </label>
                <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="direction"
                    value="left"
                    checked={direction === "left"}
                    onChange={() => setDirection("left")}
                    className="h-4 w-4 cursor-pointer accent-[#ec008c]"
                  />
                  <span>Kiri (ke 0)</span>
                </label>
              </div>
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
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ec008c] focus:ring-1 focus:ring-[#ec008c] dark:border-purple-900/60 dark:bg-[#1b1435] dark:text-white"
              >
                {VALID_ALGOS.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-purple-900/40 dark:bg-[#1a1336]/75 dark:text-gray-300">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {ALGORITHM_DESCRIPTIONS[selectedAlgorithm].title}
              </div>
              <p>{ALGORITHM_DESCRIPTIONS[selectedAlgorithm].description}</p>
              <p className="text-slate-500 dark:text-gray-400">
                {ALGORITHM_DESCRIPTIONS[selectedAlgorithm].characteristic}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                className="flex-1 cursor-pointer rounded-xl bg-[#ec008c] px-5 py-3 text-center font-semibold text-white shadow-md shadow-pink-500/25 transition-all duration-200 hover:bg-[#d1007b] active:scale-95"
              >
                Jalankan Simulasi
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-purple-900/60 dark:bg-[#1d163a] dark:text-gray-300 dark:hover:border-pink-500/40 dark:hover:bg-[#261d4a] dark:hover:text-white"
              >
                Reset
              </button>
            </div>
          </section>

          {/* RIGHT: Line Chart & Metric Cards */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-pink-500/20 dark:bg-[#140e29]/85 dark:shadow-[0_0_25px_rgba(236,72,153,0.08)] md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
                  Visualisasi Pergerakan Head
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    disabled={!hasSimulated || currentStep <= 0}
                    title="Langkah Sebelumnya"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300 dark:hover:text-white"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    title={isPlaying ? "Jeda" : "Mulai / Lanjutkan"}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#ec008c] text-white shadow-md shadow-pink-500/30 transition hover:bg-[#d1007b] active:scale-95"
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300 dark:hover:text-white"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>

                  <select
                    value={playSpeed}
                    onChange={(e) => setPlaySpeed(Number(e.target.value))}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#ec008c] focus:outline-none dark:border-purple-900/50 dark:bg-[#1e153b] dark:text-gray-300"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
              </div>

              <div className="h-[280px] w-full sm:h-[300px]">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>

              <div className="mt-4 flex min-h-[32px] items-center border-t border-slate-200/70 pt-3 text-xs text-slate-500 dark:border-purple-900/30 dark:text-gray-400">
                <span>{getStatusMessage()}</span>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-pink-500/20 dark:bg-[#140e29]/85 dark:shadow-[0_0_20px_rgba(236,72,153,0.06)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">
                  Total Head Movement (THM)
                </span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {hasSimulated ? currentResult.thm : 0}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-500">
                  {hasSimulated
                    ? `dari total ${totalTrack} track`
                    : "dari total 0 track"}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-pink-500/20 dark:bg-[#140e29]/85 dark:shadow-[0_0_20px_rgba(236,72,153,0.06)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">
                  Average Seek Time
                </span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {hasSimulated
                      ? currentResult.avgSeek % 1 === 0
                        ? currentResult.avgSeek
                        : currentResult.avgSeek.toFixed(2)
                      : 0}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-500">
                  track per permintaan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Sequence Flow */}
        {hasSimulated && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-pink-500/15 dark:bg-[#140e29]/70">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                Urutan Eksekusi Head ({selectedAlgorithm}):
              </span>
              <span className="text-xs font-medium text-[#ec008c] dark:text-pink-400">
                Langkah {currentStep} / {currentResult.sequence.length - 1}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
              {currentResult.sequence.map((track, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;
                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStep(idx);
                      }}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 font-mono text-xs font-medium transition ${
                        isActive
                          ? "scale-105 bg-[#ec008c] text-white shadow-sm shadow-pink-500/40"
                          : isPast
                            ? "border border-pink-200 bg-pink-50 text-[#ec008c] dark:border-pink-500/30 dark:bg-[#221844] dark:text-pink-300"
                            : "border border-slate-200 bg-slate-50 text-slate-500 dark:border-purple-900/30 dark:bg-[#181230] dark:text-gray-400"
                      }`}
                    >
                      {idx === 0 ? `Start: ${track}` : track}
                    </button>
                    {idx < currentResult.sequence.length - 1 && (
                      <span className="text-xs text-slate-400 dark:text-gray-600">
                        →
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        )}

        {/* BOTTOM: All Algorithms Comparison Bar Chart */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-pink-500/20 dark:bg-[#140e29]/85 dark:shadow-[0_0_25px_rgba(236,72,153,0.08)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">
              Perbandingan Semua Algoritma
            </h2>

            <div className="flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-xs font-medium text-[#ec008c] dark:border-pink-500/40 dark:bg-[#25133d] dark:text-pink-200 md:text-sm">
              <Trophy className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
              <span>
                Best Performer: <strong>{bestAlgo.algorithm}</strong> (THM{" "}
                <strong>{bestAlgo.thm}</strong>) - hemat{" "}
                <strong>{computedAll.savingsFromFCFS}%</strong> dari FCFS
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full md:h-[280px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          <p className="border-t border-slate-200/70 pt-2 text-xs leading-relaxed text-slate-500 dark:border-purple-900/30 dark:text-gray-500">
            THM dihitung pada antrean dan arah yang sama. Lompatan C-SCAN dari
            ujung ke ujung dihitung sebagai gerakan head. SCAN dan C-SCAN menuju
            ujung disk hanya jika masih ada permintaan di sisi seberang.
          </p>
        </section>
      </div>
    </div>
  );
}
