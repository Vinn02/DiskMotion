export const CARD_SURFACE_CLASSES =
  "border border-slate-200/90 bg-white/95 shadow-[0_10px_28px_-6px_rgba(15,23,42,0.08),0_2px_8px_-2px_rgba(236,0,140,0.06)] ring-1 ring-inset ring-slate-900/[0.03] backdrop-blur-[3px] dark:border-pink-500/30 dark:bg-slate-900/90 dark:shadow-[0_0_24px_-6px_rgba(236,0,140,0.22),inset_0_1px_0_0_rgba(244,114,182,0.18)] dark:ring-pink-400/15";

function AmbientPageBackdrop({ variant = "landing" }) {
  const isVisualizer = variant === "visualizer";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1A. Micro Dot-Grid (Light Mode: warna magenta gelap agar kontras di latar terang) */}
      <div
        className="absolute inset-0 opacity-[0.75] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(157, 0, 93, 0.34) 1.25px, transparent 1.25px)",
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      />

      {/* 1B. Micro Dot-Grid (Dark Mode: warna neon pink cerah agar kontras di latar gelap) */}
      <div
        className="absolute inset-0 hidden opacity-[0.55] dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 92, 184, 0.42) 1.25px, transparent 1.25px)",
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      />

      {/* 2. Ambient Glow (Sisi Kiri Atas) */}
      <div className="absolute top-[4%] -left-44 h-[460px] w-[460px] rounded-full bg-[#b8006e]/16 blur-[115px] dark:bg-[#ff2a9d]/28" />

      {/* 3. Ambient Glow (Sisi Kanan Tengah) */}
      <div className="absolute top-[36%] -right-44 h-[500px] w-[500px] rounded-full bg-[#9d005d]/15 blur-[125px] dark:bg-pink-400/24" />

      {/* 4. Ambient Glow (Sisi Kiri Bawah) */}
      <div className="absolute top-[70%] -left-40 h-[480px] w-[480px] rounded-full bg-[#b8006e]/15 blur-[125px] dark:bg-[#ff33a1]/24" />

      {/* 5. Concentric Disk Platter Rings (Kanan Atas) */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        className={`absolute ${
          isVisualizer ? "top-[6%]" : "top-[16%]"
        } -right-56 h-[560px] w-[560px] text-[#9d005d]/[0.20] dark:text-pink-300/[0.22]`}
      >
        <circle
          cx="300"
          cy="300"
          r="280"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle
          cx="300"
          cy="300"
          r="230"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="6 8"
        />
        <circle
          cx="300"
          cy="300"
          r="180"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle
          cx="300"
          cy="300"
          r="130"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="3 6"
        />
        <circle
          cx="300"
          cy="300"
          r="80"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle
          cx="300"
          cy="300"
          r="24"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <line
          x1="300"
          y1="20"
          x2="300"
          y2="580"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="300"
          x2="580"
          y2="300"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1="102"
          y1="102"
          x2="498"
          y2="498"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>

      {/* 6. Concentric Disk Platter Rings (Kiri Bawah) */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        className={`absolute ${
          isVisualizer ? "top-[52%]" : "top-[56%]"
        } -left-60 h-[580px] w-[580px] text-[#9d005d]/[0.19] dark:text-pink-300/[0.21]`}
      >
        <circle
          cx="300"
          cy="300"
          r="280"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle
          cx="300"
          cy="300"
          r="220"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="8 8"
        />
        <circle
          cx="300"
          cy="300"
          r="160"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <circle
          cx="300"
          cy="300"
          r="105"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="4 6"
        />
        <circle
          cx="300"
          cy="300"
          r="48"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <line
          x1="300"
          y1="300"
          x2="540"
          y2="140"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="468" cy="188" r="4.5" fill="currentColor" />
        <circle cx="396" cy="236" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export default AmbientPageBackdrop;
