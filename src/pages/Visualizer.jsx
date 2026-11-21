import React, { useState, useEffect, useMemo, useRef } from 'react';
import dmLogoImg from '../assets/dm-logo.png';
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sun,
  Home,
  LayoutGrid,
  Clock,
  SlidersHorizontal,
  Compass,
  LineChart as LineChartIcon,
  Trophy,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Descriptions and characteristics for Disk Scheduling Algorithms
 */
const ALGORITHM_DESCRIPTIONS = {
  FCFS: {
    title: 'FCFS - First-Come, First-Served',
    description:
      'FCFS melayani permintaan persis sesuai urutan kedatangan. Head bergerak tanpa mempertimbangkan jarak.',
    characteristic:
      'Karakteristik: Sederhana dan adil, tetapi gerakan head bisa sangat boros.',
  },
  SSTF: {
    title: 'SSTF - Shortest Seek Time First',
    description:
      'SSTF memilih permintaan dengan jarak terdekat dari posisi head saat ini untuk meminimalkan waktu pencarian.',
    characteristic:
      'Karakteristik: Sangat efisien dalam THM, namun berisiko menyebabkan starvation (kelaparan) pada request yang posisinya jauh.',
  },
  SCAN: {
    title: 'SCAN - Elevator Algorithm',
    description:
      'Head bergerak ke satu arah melayani seluruh permintaan hingga mencapai ujung track (jika masih ada permintaan di sisi seberang), lalu berbalik arah.',
    characteristic:
      'Karakteristik: Mencegah starvation dan memberikan waktu tunggu yang lebih konsisten dibanding SSTF.',
  },
  'C-SCAN': {
    title: 'C-SCAN - Circular SCAN',
    description:
      'Mirip dengan SCAN, namun saat mencapai ujung, head langsung melompat kembali ke ujung awal tanpa melayani permintaan di perjalanan kembali.',
    characteristic:
      'Karakteristik: Lompatan ujung ke ujung dihitung sebagai gerakan head. Memberikan waktu respon yang paling seragam.',
  },
};

/**
 * UTILITY FUNCTIONS FOR DISK SCHEDULING ALGORITHMS
 */

/**
 * 1. FCFS (First-Come, First-Served)
 */
export function calculateFCFS(initialHead, queue) {
  const sequence = [initialHead, ...queue];
  let thm = 0;
  const seekSteps = [];

  for (let i = 0; i < sequence.length - 1; i++) {
    const from = sequence[i];
    const to = sequence[i + 1];
    const dist = Math.abs(to - from);
    thm += dist;
    seekSteps.push({ from, to, distance: dist });
  }

  return {
    algorithm: 'FCFS',
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 2. SSTF (Shortest Seek Time First)
 */
export function calculateSSTF(initialHead, queue) {
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];
  const remaining = [...queue];
  let current = initialHead;

  while (remaining.length > 0) {
    let minDistance = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - current);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const nextTrack = remaining.splice(closestIndex, 1)[0];
    thm += minDistance;
    seekSteps.push({ from: current, to: nextTrack, distance: minDistance });
    sequence.push(nextTrack);
    current = nextTrack;
  }

  return {
    algorithm: 'SSTF',
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 3. SCAN (Elevator Algorithm)
 * Moving right: visits all tracks >= head in ascending order.
 * If there are requests < head on the opposite side, travels to maxTrack (totalTrack - 1),
 * then reverses direction and visits remaining tracks in descending order.
 */
export function calculateSCAN(initialHead, queue, totalTrack, direction = 'right') {
  const maxTrack = totalTrack - 1;
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];

  const left = queue.filter((t) => t < initialHead).sort((a, b) => b - a); // descending: 37, 14
  const right = queue.filter((t) => t > initialHead).sort((a, b) => a - b); // ascending: 65, 67, ...
  const same = queue.filter((t) => t === initialHead);

  same.forEach((t) => sequence.push(t));
  let current = initialHead;

  if (direction === 'right') {
    // Service all to the right
    for (const track of right) {
      const dist = Math.abs(track - current);
      thm += dist;
      seekSteps.push({ from: current, to: track, distance: dist });
      sequence.push(track);
      current = track;
    }

    // Only visit boundary (maxTrack) if there are requests on the opposite side
    if (left.length > 0) {
      if (current < maxTrack) {
        const dist = Math.abs(maxTrack - current);
        thm += dist;
        seekSteps.push({ from: current, to: maxTrack, distance: dist, isBoundary: true });
        sequence.push(maxTrack);
        current = maxTrack;
      }

      // Reverse direction and service left side
      for (const track of left) {
        const dist = Math.abs(track - current);
        thm += dist;
        seekSteps.push({ from: current, to: track, distance: dist });
        sequence.push(track);
        current = track;
      }
    }
  } else {
    // direction === 'left'
    for (const track of left) {
      const dist = Math.abs(track - current);
      thm += dist;
      seekSteps.push({ from: current, to: track, distance: dist });
      sequence.push(track);
      current = track;
    }

    // Only visit boundary (0) if there are requests on the opposite side
    if (right.length > 0) {
      if (current > 0) {
        const dist = Math.abs(0 - current);
        thm += dist;
        seekSteps.push({ from: current, to: 0, distance: dist, isBoundary: true });
        sequence.push(0);
        current = 0;
      }

      // Reverse direction and service right side (ascending)
      const rightAsc = [...right].sort((a, b) => a - b);
      for (const track of rightAsc) {
        const dist = Math.abs(track - current);
        thm += dist;
        seekSteps.push({ from: current, to: track, distance: dist });
        sequence.push(track);
        current = track;
      }
    }
  }

  return {
    algorithm: 'SCAN',
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 4. C-SCAN (Circular SCAN)
 * Visits requests in direction of movement.
 * Reaches boundary if requests exist on the opposite side.
 * Jumps to opposite boundary (0 or maxTrack), explicitly adding jump distance to THM!
 * Continues moving in the same direction.
 */
export function calculateCSCAN(initialHead, queue, totalTrack, direction = 'right') {
  const maxTrack = totalTrack - 1;
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];

  const left = queue.filter((t) => t < initialHead).sort((a, b) => a - b); // ascending for rightward scan
  const right = queue.filter((t) => t > initialHead).sort((a, b) => a - b); // ascending
  const same = queue.filter((t) => t === initialHead);

  same.forEach((t) => sequence.push(t));
  let current = initialHead;

  if (direction === 'right') {
    // Service all to the right
    for (const track of right) {
      const dist = Math.abs(track - current);
      thm += dist;
      seekSteps.push({ from: current, to: track, distance: dist });
      sequence.push(track);
      current = track;
    }

    // If there are requests on the other side
    if (left.length > 0) {
      // 1. Move to disk boundary (maxTrack)
      if (current < maxTrack) {
        const dist = Math.abs(maxTrack - current);
        thm += dist;
        seekSteps.push({ from: current, to: maxTrack, distance: dist, isBoundary: true });
        sequence.push(maxTrack);
        current = maxTrack;
      }

      // 2. End-to-end jump: maxTrack to 0 (explicitly calculated and added to THM)
      const jumpDistance = Math.abs(0 - maxTrack);
      thm += jumpDistance;
      seekSteps.push({
        from: maxTrack,
        to: 0,
        distance: jumpDistance,
        isJump: true,
      });
      sequence.push(0);
      current = 0;

      // 3. Continue in same direction (increasing tracks from 0)
      for (const track of left) {
        const dist = Math.abs(track - current);
        thm += dist;
        seekSteps.push({ from: current, to: track, distance: dist });
        sequence.push(track);
        current = track;
      }
    }
  } else {
    // direction === 'left'
    const leftDesc = queue.filter((t) => t < initialHead).sort((a, b) => b - a);
    const rightDesc = queue.filter((t) => t > initialHead).sort((a, b) => b - a);

    for (const track of leftDesc) {
      const dist = Math.abs(track - current);
      thm += dist;
      seekSteps.push({ from: current, to: track, distance: dist });
      sequence.push(track);
      current = track;
    }

    if (rightDesc.length > 0) {
      if (current > 0) {
        const dist = Math.abs(0 - current);
        thm += dist;
        seekSteps.push({ from: current, to: 0, distance: dist, isBoundary: true });
        sequence.push(0);
        current = 0;
      }

      // End-to-end jump: 0 to maxTrack (explicitly added to THM)
      const jumpDistance = Math.abs(maxTrack - 0);
      thm += jumpDistance;
      seekSteps.push({
        from: 0,
        to: maxTrack,
        distance: jumpDistance,
        isJump: true,
      });
      sequence.push(maxTrack);
      current = maxTrack;

      for (const track of rightDesc) {
        const dist = Math.abs(track - current);
        thm += dist;
        seekSteps.push({ from: current, to: track, distance: dist });
        sequence.push(track);
        current = track;
      }
    }
  }

  return {
    algorithm: 'C-SCAN',
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

export default function Visualizer() {
  // Input states (blank by default, ready for user inputs)
  const [totalTrack, setTotalTrack] = useState('');
  const [initialHead, setInitialHead] = useState('');
  const [queueInput, setQueueInput] = useState('');
  const [direction, setDirection] = useState('right'); // 'right' or 'left'
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');

  // Simulation execution & animation state
  const [hasSimulated, setHasSimulated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 0.5, 1, 2
  const [validationError, setValidationError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('simulasi');

  // Parse comma-separated queue input
  const parsedQueue = useMemo(() => {
    return queueInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '' && !isNaN(Number(item)))
      .map((item) => Number(item));
  }, [queueInput]);

  // Compute all 4 algorithms based on current parameters
  const computedAll = useMemo(() => {
    const head = Number(initialHead) || 0;
    const tracks = Number(totalTrack) || 200;
    const q = parsedQueue;

    const fcfs = calculateFCFS(head, q);
    const sstf = calculateSSTF(head, q);
    const scan = calculateSCAN(head, q, tracks, direction);
    const cscan = calculateCSCAN(head, q, tracks, direction);

    const list = [fcfs, sstf, scan, cscan];
    let best = list[0];
    for (const item of list) {
      if (item.thm < best.thm) {
        best = item;
      }
    }

    const savingsFromFCFS =
      fcfs.thm > 0
        ? Math.round(((fcfs.thm - best.thm) / fcfs.thm) * 100)
        : 0;

    return {
      FCFS: fcfs,
      SSTF: sstf,
      SCAN: scan,
      'C-SCAN': cscan,
      best,
      savingsFromFCFS,
    };
  }, [initialHead, totalTrack, parsedQueue, direction]);

  // Result of currently selected algorithm
  const currentResult = computedAll[selectedAlgorithm];

  // Validate inputs
  const validateInputs = () => {
    const head = Number(initialHead);
    const tracks = Number(totalTrack);

    if (isNaN(tracks) || tracks < 2) {
      setValidationError('Total track harus berupa angka minimal 2.');
      return false;
    }
    if (isNaN(head) || head < 0 || head >= tracks) {
      setValidationError(`Posisi awal head harus antara 0 dan ${tracks - 1}.`);
      return false;
    }
    if (parsedQueue.length === 0) {
      setValidationError('Antrean permintaan tidak boleh kosong.');
      return false;
    }
    const outOfBounds = parsedQueue.filter((t) => t < 0 || t >= tracks);
    if (outOfBounds.length > 0) {
      setValidationError(
        `Track [${outOfBounds.join(', ')}] berada di luar rentang (0 - ${tracks - 1}).`
      );
      return false;
    }
    setValidationError('');
    return true;
  };

  // Run simulation handler
  const handleRunSimulation = () => {
    if (!validateInputs()) return;
    setHasSimulated(true);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  // Reset handler
  const handleReset = () => {
    setTotalTrack('');
    setInitialHead('');
    setQueueInput('');
    setDirection('right');
    setSelectedAlgorithm('FCFS');
    setHasSimulated(false);
    setCurrentStep(0);
    setIsPlaying(false);
    setValidationError('');
  };

  // Animation timer effect
  useEffect(() => {
    if (!isPlaying || !hasSimulated) return;

    const delay = 700 / playSpeed;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < currentResult.sequence.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, delay);

    return () => clearInterval(timer);
  }, [isPlaying, hasSimulated, playSpeed, currentResult.sequence.length]);

  // Stepping controls
  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(currentResult.sequence.length - 1, prev + 1));
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

  // Head movement visible data points
  const visiblePoints = useMemo(() => {
    if (!hasSimulated) return [];
    return currentResult.sequence.slice(0, currentStep + 1).map((track, step) => ({
      x: track,
      y: step,
    }));
  }, [hasSimulated, currentResult.sequence, currentStep]);

  // Line Chart Configuration
  const lineChartData = {
    datasets: [
      {
        label: 'Pergerakan Head',
        data: visiblePoints,
        borderColor: '#ec4899', // Neon pink accent
        backgroundColor: '#ec4899',
        borderWidth: 2.5,
        tension: 0, // Straight lines between cylinders
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: visiblePoints.map((pt, idx) =>
          idx === 0
            ? '#38bdf8' // Cyan for start
            : idx === currentStep
            ? '#f43f5e' // Bright red/pink for active head
            : '#ec4899'
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        segment: {
          borderDash: (ctx) => {
            // Render C-SCAN circular jumps as dashed line
            const p0Idx = ctx.p0DataIndex;
            const p1Idx = ctx.p1DataIndex;
            if (
              selectedAlgorithm === 'C-SCAN' &&
              p0Idx !== undefined &&
              p1Idx !== undefined
            ) {
              const fromVal = visiblePoints[p0Idx]?.x;
              const toVal = visiblePoints[p1Idx]?.x;
              if (Math.abs(fromVal - toVal) >= totalTrack - 2) {
                return [6, 4];
              }
            }
            return undefined;
          },
          borderColor: (ctx) => {
            const p0Idx = ctx.p0DataIndex;
            const p1Idx = ctx.p1DataIndex;
            if (
              selectedAlgorithm === 'C-SCAN' &&
              p0Idx !== undefined &&
              p1Idx !== undefined
            ) {
              const fromVal = visiblePoints[p0Idx]?.x;
              const toVal = visiblePoints[p1Idx]?.x;
              if (Math.abs(fromVal - toVal) >= totalTrack - 2) {
                return 'rgba(236, 72, 153, 0.45)';
              }
            }
            return '#ec4899';
          },
        },
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isPlaying ? 250 : 400,
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: Math.max(10, (Number(totalTrack) || 200) - 1),
        title: {
          display: true,
          text: 'Nomor track',
          color: '#9ca3af',
          font: { size: 12, weight: '500' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: Math.max(10, Math.round((Number(totalTrack) || 200) / 10)),
        },
      },
      y: {
        type: 'linear',
        reverse: true, // INVERTED: step 0 is at the top!
        min: 0,
        max: Math.max(8, (currentResult?.sequence?.length || 9) - 1),
        title: {
          display: true,
          text: 'Langkah eksekusi',
          color: '#9ca3af',
          font: { size: 12, weight: '500' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1c1538',
        titleColor: '#f472b6',
        bodyColor: '#ffffff',
        borderColor: '#ec4899',
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

  // Bar Chart Configuration
  const barAlgorithms = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'];
  const barValues = barAlgorithms.map((algo) => computedAll[algo].thm);
  const bestAlgo = computedAll.best;

  const barChartData = {
    labels: barAlgorithms,
    datasets: [
      {
        label: 'Total Head Movement',
        data: barValues,
        backgroundColor: barAlgorithms.map((algo) =>
          algo === bestAlgo.algorithm
            ? '#ec4899' // Solid neon pink for best performer
            : 'rgba(236, 72, 153, 0.35)' // Translucent magenta for others
        ),
        borderColor: barAlgorithms.map((algo) =>
          algo === bestAlgo.algorithm ? '#f43f5e' : 'rgba(236, 72, 153, 0.7)'
        ),
        borderWidth: barAlgorithms.map((algo) =>
          algo === bestAlgo.algorithm ? 2 : 1.5
        ),
        borderRadius: 8,
        hoverBackgroundColor: '#f43f5e',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1c1538',
        titleColor: '#f472b6',
        bodyColor: '#ffffff',
        borderColor: '#ec4899',
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
        grid: {
          display: false,
        },
        ticks: {
          color: '#d1d5db',
          font: { weight: '600', size: 13 },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Head Movement',
          color: '#9ca3af',
          font: { size: 12, weight: '500' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 100,
        },
      },
    },
  };

  // Status message below the Line Chart
  const getStatusMessage = () => {
    if (!hasSimulated) {
      return 'Tekan Jalankan Simulasi untuk memulai.';
    }
    if (currentStep === 0) {
      return `Head berada di posisi awal track ${initialHead}.`;
    }
    const stepInfo = currentResult.seekSteps[currentStep - 1];
    if (!stepInfo) return 'Simulasi selesai.';

    if (stepInfo.isJump) {
      return `Langkah ${currentStep}: Lompatan C-SCAN dari ujung track ${stepInfo.from} ke track ${stepInfo.to} (Jarak lompatan: ${stepInfo.distance} track).`;
    }
    if (stepInfo.isBoundary) {
      return `Langkah ${currentStep}: Head mencapai batas disk di track ${stepInfo.to} (Jarak: ${stepInfo.distance} track).`;
    }
    return `Langkah ${currentStep}: Head berpindah dari track ${stepInfo.from} ke ${stepInfo.to} (Jarak pencarian: ${stepInfo.distance} track).`;
  };

  return (
    <div className="min-h-screen bg-[#0b0816] text-gray-100 flex flex-col relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Ambient neon pink and purple glow backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-5%] left-[25%] w-[600px] h-[500px] bg-pink-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[10%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[650px] h-[450px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navbar matching Figma Design */}
      <nav className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-purple-900/20 bg-[#0c081b]/60 backdrop-blur-md">
        {/* Top Left: DM Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 flex items-center justify-center select-none cursor-pointer">
            <img
              src={dmLogoImg}
              alt="DM Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(236,72,153,0.85)]"
            />
          </div>
        </div>

        {/* Top Center: Floating Navigation Pill */}
        <div className="flex items-center bg-[#16112a]/90 backdrop-blur-md border border-pink-500/20 rounded-full px-3 py-1.5 shadow-[0_0_20px_rgba(236,72,153,0.18)] gap-1">
          <button
            onClick={() => setActiveTab('home')}
            title="Beranda"
            className={`p-2 rounded-full transition cursor-pointer ${
              activeTab === 'home'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            className={`p-2 rounded-full transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('history')}
            title="Riwayat"
            className={`p-2 rounded-full transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('simulasi')}
            title="Pengaturan / Simulasi"
            className={`p-2 rounded-full transition cursor-pointer ${
              activeTab === 'simulasi'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Top Right: Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full bg-[#17112e] border border-purple-900/50 flex items-center justify-center text-amber-400 hover:text-amber-300 transition shadow-[0_0_12px_rgba(251,191,36,0.15)] cursor-pointer"
            title="Mode Gelap Aktif"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Section Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              Simulasi
            </h1>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="flex items-center gap-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Top Grid: Control Panel (Left) & Head Movement Visualization (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Control Panel */}
            <section className="lg:col-span-5 bg-[#140e29]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl p-5 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Panel Kontrol
              </h2>

              {/* Number Inputs: Total Track & Initial Head */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Total track (0 - N)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={totalTrack}
                    onChange={(e) => setTotalTrack(e.target.value)}
                    className="w-full bg-[#1b1435] border border-purple-900/60 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-white text-sm transition outline-none"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Posisi awal head
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalTrack - 1}
                    value={initialHead}
                    onChange={(e) => setInitialHead(e.target.value)}
                    className="w-full bg-[#1b1435] border border-purple-900/60 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-white text-sm transition outline-none"
                    placeholder="53"
                  />
                </div>
              </div>

              {/* Text Input: Request Queue */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Antrean permintaan (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={queueInput}
                  onChange={(e) => setQueueInput(e.target.value)}
                  className="w-full bg-[#1b1435] border border-purple-900/60 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-white text-sm transition outline-none"
                  placeholder="98, 183, 37, 122, 14, 124, 65, 67"
                />
              </div>

              {/* Initial Direction Radio Buttons */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Arah awal
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-200 select-none">
                    <input
                      type="radio"
                      name="direction"
                      value="right"
                      checked={direction === 'right'}
                      onChange={() => setDirection('right')}
                      className="accent-pink-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Kanan (ke {Math.max(0, totalTrack - 1)})</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-200 select-none">
                    <input
                      type="radio"
                      name="direction"
                      value="left"
                      checked={direction === 'left'}
                      onChange={() => setDirection('left')}
                      className="accent-pink-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Kiri (ke 0)</span>
                  </label>
                </div>
              </div>

              {/* Algorithm Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Algoritma
                </label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="w-full bg-[#1b1435] border border-purple-900/60 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-white text-sm transition outline-none cursor-pointer"
                >
                  <option value="FCFS">FCFS</option>
                  <option value="SSTF">SSTF</option>
                  <option value="SCAN">SCAN</option>
                  <option value="C-SCAN">C-SCAN</option>
                </select>
              </div>

              {/* Dynamic Algorithm Description Box */}
              <div className="bg-[#1a1336]/75 border border-purple-900/40 rounded-xl p-4 text-xs leading-relaxed space-y-2 text-gray-300">
                <div className="font-semibold text-white text-sm">
                  {ALGORITHM_DESCRIPTIONS[selectedAlgorithm].title}
                </div>
                <p>{ALGORITHM_DESCRIPTIONS[selectedAlgorithm].description}</p>
                <p className="text-gray-400">
                  {ALGORITHM_DESCRIPTIONS[selectedAlgorithm].characteristic}
                </p>
              </div>

              {/* Action Buttons: Jalankan Simulasi & Reset */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  className="flex-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-400 text-white font-semibold py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.55)] transition-all duration-200 active:scale-95 text-center cursor-pointer"
                >
                  Jalankan Simulasi
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#1d163a] hover:bg-[#261d4a] border border-purple-900/60 hover:border-pink-500/40 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition duration-200 active:scale-95 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </section>

            {/* RIGHT: Line Chart & Metric Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Head Movement Line Chart Card */}
              <section className="bg-[#140e29]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl p-5 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] flex flex-col">
                {/* Header with Title and Playback Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-white tracking-wide">
                    Visualisasi Pergerakan Head
                  </h2>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStepBack}
                      disabled={!hasSimulated || currentStep <= 0}
                      title="Langkah Sebelumnya"
                      className="w-8 h-8 rounded-lg bg-[#1e153b] border border-purple-900/50 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      title={isPlaying ? 'Jeda' : 'Mulai / Lanjutkan'}
                      className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.6)] transition active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
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
                      className="w-8 h-8 rounded-lg bg-[#1e153b] border border-purple-900/50 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Speed selector */}
                    <select
                      value={playSpeed}
                      onChange={(e) => setPlaySpeed(Number(e.target.value))}
                      className="bg-[#1e153b] border border-purple-900/50 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:border-pink-500 focus:outline-none cursor-pointer"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                </div>

                {/* Line Chart Area */}
                <div className="h-[280px] sm:h-[300px] w-full">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>

                {/* Live simulation status caption */}
                <div className="mt-4 pt-3 border-t border-purple-900/30 text-xs text-gray-400 min-h-[32px] flex items-center">
                  <span>{getStatusMessage()}</span>
                </div>
              </section>

              {/* Two Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Head Movement (THM) */}
                <div className="bg-[#140e29]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(236,72,153,0.06)] flex flex-col justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Head Movement (THM)
                  </span>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                      {hasSimulated ? currentResult.thm : 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {hasSimulated
                      ? `dari total ${totalTrack} track`
                      : 'dari total 0 track'}
                  </span>
                </div>

                {/* Average Seek Time */}
                <div className="bg-[#140e29]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(236,72,153,0.06)] flex flex-col justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Average Seek Time
                  </span>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                      {hasSimulated
                        ? currentResult.avgSeek % 1 === 0
                          ? currentResult.avgSeek
                          : currentResult.avgSeek.toFixed(2)
                        : 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    track per permintaan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Sequence Flow (Interactive step pills) */}
          {hasSimulated && (
            <section className="bg-[#140e29]/70 backdrop-blur-md border border-pink-500/15 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">
                  Urutan Eksekusi Head ({selectedAlgorithm}):
                </span>
                <span className="text-xs text-pink-400">
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
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStep(idx);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)] scale-105'
                            : isPast
                            ? 'bg-[#221844] text-pink-300 border border-pink-500/30'
                            : 'bg-[#181230] text-gray-400 border border-purple-900/30'
                        }`}
                      >
                        {idx === 0 ? `Start: ${track}` : track}
                      </button>
                      {idx < currentResult.sequence.length - 1 && (
                        <span className="text-gray-600 text-xs">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          )}

          {/* BOTTOM: All Algorithms Comparison Bar Chart */}
          <section className="bg-[#140e29]/85 backdrop-blur-md border border-pink-500/20 rounded-2xl p-5 md:p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] flex flex-col gap-4">
            {/* Header with Title and Best Performer Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Perbandingan Semua Algoritma
              </h2>

              {/* Best Performer Badge */}
              <div className="flex items-center gap-2 bg-[#25133d] border border-pink-500/40 text-pink-200 text-xs md:text-sm font-medium px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.25)]">
                <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Best Performer: <strong>{bestAlgo.algorithm}</strong> (THM{' '}
                  <strong>{bestAlgo.thm}</strong>) - hemat{' '}
                  <strong>{computedAll.savingsFromFCFS}%</strong> dari FCFS
                </span>
              </div>
            </div>

            {/* Bar Chart Canvas */}
            <div className="h-[260px] md:h-[280px] w-full">
              <Bar data={barChartData} options={barChartOptions} />
            </div>

            {/* Footnote matching screenshot */}
            <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-purple-900/30">
              THM dihitung pada antrean dan arah yang sama. Lompatan C-SCAN dari ujung ke ujung dihitung sebagai gerakan head. SCAN dan C-SCAN menuju ujung disk hanya jika masih ada permintaan di sisi seberang.
            </p>
          </section>
        </main>
      </div>

      {/* Footer matching Figma Design */}
      <footer className="relative z-10 w-full mt-12 border-t border-purple-900/30 bg-[#090615]/80 backdrop-blur-md py-10 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              DiskMotion Visualizer
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Interactive Disk Scheduling Simulator & Learning Hub untuk mempermudah pemahaman Operating System Concepts.
            </p>
          </div>
          <div className="pt-4 border-t border-purple-900/20 text-xs text-gray-500">
            © 2026 DiskMotion Visualizer • Interactive OS Lab
          </div>
        </div>
      </footer>
    </div>
  );
}
