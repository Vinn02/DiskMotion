import { VALID_ALGOS } from "../constants/diskConfig";

export function buildLineChartData(
  visiblePoints,
  currentStep,
  selectedAlgorithm,
  totalTrack,
) {
  const maxTrackSpan = Number(totalTrack) - 2;

  return {
    datasets: [
      {
        label: "Pergerakan Head",
        data: visiblePoints,
        borderColor: "#ec008c",
        backgroundColor: "#ec008c",
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: visiblePoints.map((_, idx) =>
          idx === 0 ? "#0ea5e9" : idx === currentStep ? "#f43f5e" : "#ec008c",
        ),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        segment: {
          borderDash: (ctx) => {
            if (selectedAlgorithm !== "C-SCAN") return undefined;
            const fromVal = visiblePoints[ctx.p0DataIndex]?.x;
            const toVal = visiblePoints[ctx.p1DataIndex]?.x;
            if (
              fromVal !== undefined &&
              toVal !== undefined &&
              Math.abs(fromVal - toVal) >= maxTrackSpan
            ) {
              return [6, 4];
            }
            return undefined;
          },
          borderColor: (ctx) => {
            if (selectedAlgorithm !== "C-SCAN") return "#ec008c";
            const fromVal = visiblePoints[ctx.p0DataIndex]?.x;
            const toVal = visiblePoints[ctx.p1DataIndex]?.x;
            if (
              fromVal !== undefined &&
              toVal !== undefined &&
              Math.abs(fromVal - toVal) >= maxTrackSpan
            ) {
              return "rgba(236, 0, 140, 0.45)";
            }
            return "#ec008c";
          },
        },
      },
    ],
  };
}

export function buildLineChartOptions({
  isPlaying,
  totalTrack,
  sequenceLength,
  isDarkMode,
}) {
  const tracks = Number(totalTrack) || 200;
  const textColor = isDarkMode ? "#94a3b8" : "#475569";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.07)"
    : "rgba(15, 23, 42, 0.08)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isPlaying ? 250 : 400,
    },
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: Math.max(10, tracks - 1),
        title: {
          display: true,
          text: "Nomor track",
          color: textColor,
          font: { size: 12, weight: "600" },
        },
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          stepSize: Math.max(10, Math.round(tracks / 10)),
        },
      },
      y: {
        type: "linear",
        reverse: true,
        min: 0,
        max: Math.max(8, (sequenceLength || 9) - 1),
        title: {
          display: true,
          text: "Langkah eksekusi",
          color: textColor,
          font: { size: 12, weight: "600" },
        },
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          stepSize: 1,
          precision: 0,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? "#1c1538" : "#0f172a",
        titleColor: "#f472b6",
        bodyColor: "#ffffff",
        borderColor: "#ec008c",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const step = context.raw.y;
            const track = context.raw.x;
            if (step === 0) return `Posisi Awal Head: Track ${track}`;
            return `Langkah ${step}: Menuju Track ${track}`;
          },
        },
      },
    },
  };
}

export function buildBarChartData(computedAll, isDarkMode) {
  const bestAlgo = computedAll.best;
  const barValues = VALID_ALGOS.map((algo) => computedAll[algo].thm);

  return {
    labels: VALID_ALGOS,
    datasets: [
      {
        label: "Total Head Movement",
        data: barValues,
        backgroundColor: VALID_ALGOS.map((algo) =>
          algo === bestAlgo.algorithm
            ? "#ec008c"
            : isDarkMode
              ? "rgba(236, 72, 153, 0.35)"
              : "rgba(236, 0, 140, 0.22)",
        ),
        borderColor: VALID_ALGOS.map((algo) =>
          algo === bestAlgo.algorithm ? "#f43f5e" : "rgba(236, 0, 140, 0.7)",
        ),
        borderWidth: VALID_ALGOS.map((algo) =>
          algo === bestAlgo.algorithm ? 2 : 1.5,
        ),
        borderRadius: 8,
        hoverBackgroundColor: "#f43f5e",
      },
    ],
  };
}

export function buildBarChartOptions(computedAll, isDarkMode) {
  const bestAlgo = computedAll.best;
  const textColor = isDarkMode ? "#cbd5e1" : "#334155";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.07)"
    : "rgba(15, 23, 42, 0.08)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? "#1c1538" : "#0f172a",
        titleColor: "#f472b6",
        bodyColor: "#ffffff",
        borderColor: "#ec008c",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const algo = context.label;
            const thm = context.raw;
            const isBest = algo === bestAlgo.algorithm;
            return [
              `Total Head Movement: ${thm} track`,
              isBest
                ? `🏆 Performa Terbaik! Hemat ${computedAll.savingsFromFCFS}% vs FCFS`
                : `Selisih: +${thm - bestAlgo.thm} track dari ${bestAlgo.algorithm}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { weight: "600", size: 13 },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Head Movement",
          color: textColor,
          font: { size: 12, weight: "600" },
        },
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          stepSize: 100,
        },
      },
    },
  };
}
