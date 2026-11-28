import { VALID_ALGOS } from "../constants/diskConfig";

/**
 * Helper untuk memformat teks judul sumbu dengan spasi antar huruf yang proporsional
 */
function formatSpacedLabel(text) {
  return text.split("").join("\u200A\u200A");
}

export function buildLineChartData(
  visiblePoints,
  currentStep,
  selectedAlgorithm,
  totalTrack,
) {
  const maxTrack = Number(totalTrack) > 0 ? Number(totalTrack) - 1 : 199;

  return {
    datasets: [
      {
        label: `Jalur Head (${selectedAlgorithm})`,
        data: visiblePoints,
        borderColor: "#ec008c",
        backgroundColor: "rgba(236, 0, 140, 0.14)",
        borderWidth: 3,
        tension: 0,
        fill: false,
        showLine: true,
        spanGaps: true,
        pointRadius: (ctx) => (ctx.dataIndex === currentStep ? 7 : 4.5),
        pointHoverRadius: 8,
        pointBackgroundColor: (ctx) =>
          ctx.dataIndex === currentStep ? "#ff2a9d" : "#ec008c",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      // Dataset bayangan tak terlihat untuk menjaga skala X tetap konsisten (0 - maxTrack)
      {
        label: "_bounds",
        data: [
          { x: 0, y: 0 },
          { x: maxTrack, y: 0 },
        ],
        borderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        showLine: false,
      },
    ],
  };
}

export function buildLineChartOptions({
  playSpeed = 1,
  totalTrack,
  sequenceLength,
  isDarkMode = false,
}) {
  const maxTrack = Number(totalTrack) > 0 ? Number(totalTrack) - 1 : 199;
  const maxStep = sequenceLength > 1 ? sequenceLength - 1 : 8;
  const duration = Math.max(240, Math.round(540 / playSpeed));

  const gridColor = isDarkMode
    ? "rgba(148, 163, 184, 0.12)"
    : "rgba(15, 23, 42, 0.08)";
  const tickColor = isDarkMode ? "#94a3b8" : "#475569";
  const titleColor = isDarkMode ? "#cbd5e1" : "#334155";

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Nonaktifkan animasi global agar titik lama tidak ikut bergeser
    },
    animations: {
      // Hanya titik terakhir (terbaru) yang bergerak mengalir dari titik sebelumnya;
      // titik-titik sebelumnya tetap diam di koordinatnya masing-masing.
      x: {
        type: "number",
        easing: "easeOutCubic",
        duration,
        from(ctx) {
          if (ctx.type !== "data" || ctx.datasetIndex !== 0) return undefined;
          const data = ctx.chart.data.datasets[0]?.data || [];
          const lastIndex = data.length - 1;
          if (
            ctx.dataIndex === lastIndex &&
            lastIndex > 0 &&
            data[lastIndex - 1]
          ) {
            return ctx.chart.scales.x.getPixelForValue(data[lastIndex - 1].x);
          }
          if (data[ctx.dataIndex]) {
            return ctx.chart.scales.x.getPixelForValue(data[ctx.dataIndex].x);
          }
          return undefined;
        },
      },
      y: {
        type: "number",
        easing: "easeOutCubic",
        duration,
        from(ctx) {
          if (ctx.type !== "data" || ctx.datasetIndex !== 0) return undefined;
          const data = ctx.chart.data.datasets[0]?.data || [];
          const lastIndex = data.length - 1;
          if (
            ctx.dataIndex === lastIndex &&
            lastIndex > 0 &&
            data[lastIndex - 1]
          ) {
            return ctx.chart.scales.y.getPixelForValue(data[lastIndex - 1].y);
          }
          if (data[ctx.dataIndex]) {
            return ctx.chart.scales.y.getPixelForValue(data[ctx.dataIndex].y);
          }
          return undefined;
        },
      },
      radius: {
        duration: 220,
        easing: "easeOutBack",
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        filter: (item) => item.datasetIndex === 0,
        backgroundColor: isDarkMode ? "#1b1336" : "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#f472b6",
        borderColor: "rgba(236, 0, 140, 0.45)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items) => `Langkah ${items[0]?.parsed?.y ?? 0}`,
          label: (item) => `Posisi Head: Track ${item.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "top",
        min: 0,
        max: maxTrack,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
          font: { size: 11, family: "monospace" },
        },
        title: {
          display: true,
          text: "Nomor Track",
          color: titleColor,
          font: { size: 11, weight: "600" },
        },
      },
      y: {
        type: "linear",
        reverse: true,
        min: 0,
        max: maxStep,
        grid: {
          color: gridColor,
        },
        ticks: {
          stepSize: 1,
          color: tickColor,
          font: { size: 11, family: "monospace" },
        },
        title: {
          display: true,
          text: formatSpacedLabel("Langkah Eksekusi"),
          color: titleColor,
          font: { size: 11, weight: "600" },
        },
      },
    },
  };
}

export function buildBarChartData(computedAll, isDarkMode = false) {
  const algos = VALID_ALGOS;
  const bestAlgo = computedAll?.best?.algorithm;

  return {
    labels: algos,
    datasets: [
      {
        label: "Total Head Movement",
        data: algos.map((algo) => computedAll?.[algo]?.thm ?? 0),
        backgroundColor: algos.map((algo) =>
          algo === bestAlgo
            ? "#ec008c"
            : isDarkMode
              ? "rgba(168, 85, 247, 0.45)"
              : "rgba(236, 0, 140, 0.25)",
        ),
        borderColor: algos.map((algo) =>
          algo === bestAlgo ? "#ff33a8" : "#ec008c",
        ),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };
}

export function buildBarChartOptions(computedAll, isDarkMode = false) {
  const gridColor = isDarkMode
    ? "rgba(148, 163, 184, 0.12)"
    : "rgba(15, 23, 42, 0.08)";
  const tickColor = isDarkMode ? "#94a3b8" : "#475569";
  const titleColor = isDarkMode ? "#cbd5e1" : "#334155";

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#1b1336" : "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#f472b6",
        borderColor: "rgba(236, 0, 140, 0.45)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (item) => {
            const algo = item.label;
            const avg = computedAll?.[algo]?.avgSeek ?? 0;
            return [
              `THM: ${item.parsed.y} track`,
              `Avg Seek: ${Number(avg).toFixed(2)} track/req`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
          font: { size: 11, weight: "600" },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
          font: { size: 11, family: "monospace" },
        },
        title: {
          display: true,
          text: formatSpacedLabel("Total Head Movement"),
          color: titleColor,
          font: { size: 11, weight: "600" },
        },
      },
    },
  };
}
