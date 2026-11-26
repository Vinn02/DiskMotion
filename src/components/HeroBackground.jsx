import { useEffect, useRef, useState } from "react";
import { TrendingUp, SlidersHorizontal, Scale, Trophy } from "lucide-react";

const FLOATING_BADGES = [
  {
    id: "badge-top-left",
    posClass: "top-[16%] left-[10%] md:left-[18%]",
    tiltClass: "rotate-12",
    Icon: SlidersHorizontal,
    delay: "-1.2s",
  },
  {
    id: "badge-top-right",
    posClass: "top-[15%] right-[11%] md:right-[20%]",
    tiltClass: "-rotate-6",
    Icon: TrendingUp,
    delay: "0s",
  },
  {
    id: "badge-bottom-left",
    posClass: "bottom-[22%] left-[7%] md:left-[13%]",
    tiltClass: "-rotate-12",
    Icon: Scale,
    delay: "-2.4s",
  },
  {
    id: "badge-bottom-right",
    posClass: "bottom-[26%] right-[7%] md:right-[14%]",
    tiltClass: "rotate-12",
    Icon: Trophy,
    delay: "-3.6s",
  },
];

const FLOATING_PARTICLES = [
  { top: "14%", left: "34%", size: 4, opacity: 0.75, delay: "0s", dur: "6s" },
  {
    top: "28%",
    left: "7%",
    size: 3,
    opacity: 0.5,
    delay: "-1.5s",
    dur: "7.5s",
  },
  {
    top: "26%",
    left: "86%",
    size: 3.5,
    opacity: 0.7,
    delay: "-2.8s",
    dur: "6.8s",
  },
  {
    top: "46%",
    left: "24%",
    size: 2.5,
    opacity: 0.45,
    delay: "-0.8s",
    dur: "8s",
  },
  {
    top: "48%",
    left: "75%",
    size: 3,
    opacity: 0.55,
    delay: "-3.4s",
    dur: "7.2s",
  },
  {
    top: "62%",
    left: "92%",
    size: 3.5,
    opacity: 0.65,
    delay: "-1.9s",
    dur: "6.4s",
  },
  {
    top: "17%",
    left: "63%",
    size: 2.5,
    opacity: 0.5,
    delay: "-4.1s",
    dur: "7.8s",
  },
  {
    top: "72%",
    left: "38%",
    size: 2.5,
    opacity: 0.45,
    delay: "-2.2s",
    dur: "8.4s",
  },
];

const PULSE_CELLS = [
  { col: 5, row: 2, delay: "0s", dur: "4.4s" },
  { col: 10, row: 2, delay: "1.6s", dur: "4.8s" },
  { col: 6, row: 3, delay: "0.8s", dur: "4.1s" },
  { col: 9, row: 4, delay: "2.3s", dur: "4.6s" },
  { col: 4, row: 4, delay: "1.9s", dur: "5.0s" },
];

export default function HeroBackground({ onVisibilityChange }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        onVisibilityChange?.(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisibilityChange]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${
        !isVisible ? "dm-paused" : ""
      }`}
      aria-hidden="true"
    >
      {/* 1. Ambient Radial & Horizon Glow */}
      <div className="dm-hero-glow absolute inset-0" />

      {/* 2. Full-Width 3D Perspective Floor Grid (Spasi Lebih Besar & Lega) */}
      <div className="dm-hero-perspective">
        <div className="dm-hero-grid">
          {PULSE_CELLS.map((cell, idx) => (
            <span
              key={idx}
              className="dm-grid-pulse"
              style={{
                gridColumn: cell.col,
                gridRow: cell.row,
                animationDelay: cell.delay,
                animationDuration: cell.dur,
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Vignette Fade atas & bawah */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8f9fb]/90 dark:to-slate-950/90" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8f9fb] to-transparent dark:from-slate-950" />

      {/* 4. Floating White Particles */}
      {FLOATING_PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="dm-hero-particle"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--p-opacity": p.opacity,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}

      {/* 5. Balanced 4-Corner Floating Glass Icon Boxes (Konsisten dengan Features) */}
      {FLOATING_BADGES.map(({ id, posClass, tiltClass, Icon, delay }) => (
        <div
          key={id}
          style={{ animationDelay: delay }}
          className={`dm-float-badge hidden sm:flex ${posClass}`}
        >
          <div className={`dm-icon-box ${tiltClass}`}>
            <Icon
              className="h-6 w-6 text-[#ec008c] dark:text-pink-100"
              strokeWidth={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
