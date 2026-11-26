import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Gamepad2,
  TrendingUp,
  SlidersHorizontal,
  Scale,
  Trophy,
  Clock,
  GitCommitHorizontal,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const FEATURES_DATA = [
  {
    title: "Real-Time Graph",
    description:
      "Pantau pergerakan lintasan head disk secara visual dan langsung.",
    icon: TrendingUp,
  },
  {
    title: "Custom Input",
    description:
      "Atur posisi awal head dan urutan antrean track sesuai skenario.",
    icon: SlidersHorizontal,
  },
  {
    title: "Komparasi Algoritma",
    description:
      "Bandingkan efisiensi jarak perpindahan antar algoritma secara adil.",
    icon: Scale,
  },
  {
    title: "Gamifikasi Edukasi",
    description: "Uji pemahamanmu lewat tantangan tebak urutan langkah head.",
    icon: Trophy,
  },
];

const METRICS_DATA = [
  {
    title: "Seek Time",
    subtitle: "Waktu Pencarian",
    icon: Clock,
  },
  {
    title: "Total Head Movement",
    subtitle: "Total Pergerakan Head",
    icon: GitCommitHorizontal,
  },
  {
    title: "Throughput Data",
    subtitle: "Kecepatan Layanan",
    icon: Zap,
  },
];

const ALGORITHMS_DATA = [
  {
    code: "FCFS",
    name: "First Come, First Served",
    tag: "Urutan Kedatangan",
    description:
      "Melayani antrean berdasarkan urutan kedatangan tanpa pengurutan ulang posisi track.",
  },
  {
    code: "SSTF",
    name: "Shortest Seek Time First",
    tag: "Jarak Terdekat",
    description:
      "Memilih permintaan dengan jarak track terdekat dari posisi head saat ini.",
  },
  {
    code: "SCAN",
    name: "Elevator Algorithm",
    tag: "Bolak-Balik",
    description:
      "Head bergerak ke satu arah hingga ujung disk lalu berbalik arah melayani sisa antrean.",
  },
  {
    code: "C-SCAN",
    name: "Circular SCAN",
    tag: "Satu Arah",
    description:
      "Head melayani satu arah saja, lalu langsung kembali ke awal untuk putaran berikutnya.",
  },
];

function RevealSection({ children, id, className = "", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </section>
  );
}

function SectionBadge({ label }) {
  return (
    <span className="inline-block rounded-full bg-[#ec008c] px-4 py-1 text-xs font-semibold tracking-wide text-white shadow-sm shadow-pink-500/20">
      {label}
    </span>
  );
}

function LandingPage() {
  return (
    <div className="bg-[#f8f9fb] text-slate-900 transition-colors duration-300 selection:bg-pink-100 selection:text-[#ec008c] dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-pink-500/20 dark:selection:text-pink-300">
      {/* HERO SECTION */}
      <RevealSection
        id="home"
        className="mx-auto flex max-w-4xl scroll-mt-20 flex-col items-center px-6 pt-24 pb-28 text-center md:pt-32 md:pb-36"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
          Disk <span className="text-[#ec008c]">Motion</span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
          Pelajari algoritma disk scheduling dengan visualisasi real-time.
          Pahami FCFS, SSTF, SCAN, dan C-SCAN melalui simulasi interaktif &amp;
          minigame seru.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/visualisasi"
            className="inline-flex items-center gap-2 rounded-full bg-[#ec008c] px-7 py-3 text-sm font-semibold text-white shadow-md shadow-pink-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d1007b] hover:shadow-lg hover:shadow-pink-500/30 active:translate-y-0"
          >
            <Play className="h-4 w-4 fill-current" />
            Mulai Simulasi
          </Link>

          <Link
            to="/minigame"
            className="inline-flex items-center gap-2 rounded-full border border-[#ec008c] bg-white px-7 py-3 text-sm font-semibold text-[#ec008c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-50 active:translate-y-0 dark:bg-slate-900 dark:text-pink-400 dark:hover:bg-slate-800"
          >
            <Gamepad2 className="h-4 w-4" />
            Mode Mini Game
          </Link>
        </div>
      </RevealSection>

      {/* FEATURES SECTION */}
      <RevealSection
        id="features"
        className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
      >
        <SectionBadge label="Features" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Semua Fitur yang Kamu Butuhkan
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES_DATA.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <article
                key={feature.title}
                className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-5 py-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-pink-500/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-[#ec008c] transition-transform duration-300 group-hover:scale-110 dark:bg-pink-500/15 dark:text-pink-400">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 dark:text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </RevealSection>

      {/* ABOUT SECTION */}
      <RevealSection
        id="about"
        className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
      >
        <SectionBadge label="About" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Apa Itu Disk Motion / Disk Scheduling
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Mekanisme Sistem Operasi untuk menentukan urutan eksekusi permintaan
          Input/Output (I/O) pada piringan hard disk. Tujuannya adalah menghemat
          pergerakan head mekanis agar respons sistem menjadi secepat mungkin.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {METRICS_DATA.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <article
                key={metric.title}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-pink-500/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ec008c] text-white shadow-sm shadow-pink-500/20 transition-transform duration-300 group-hover:scale-105">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {metric.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {metric.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </RevealSection>

      {/* ALGORITHM SECTION */}
      <RevealSection
        id="algorithm"
        className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
      >
        <SectionBadge label="Algorithms" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Algoritma Utama yang Dipelajari
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ALGORITHMS_DATA.map((algo) => (
            <Link
              key={algo.code}
              to={`/visualisasi?algo=${algo.code}`}
              className="group flex flex-col items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/10 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-pink-500/50"
            >
              <div>
                <div className="inline-flex items-center gap-1 text-sm font-extrabold tracking-wide text-[#ec008c] dark:text-pink-400">
                  <span>{algo.code}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
                <h3 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                  {algo.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {algo.description}
                </p>
              </div>

              <span className="mt-5 inline-block rounded-full bg-pink-50 px-3 py-1 text-[10px] font-semibold text-[#ec008c] dark:bg-pink-500/15 dark:text-pink-300">
                {algo.tag}
              </span>
            </Link>
          ))}
        </div>
      </RevealSection>

      {/* MINI GAME CTA BANNER */}
      <RevealSection className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ff2a85] via-[#ec008c] to-[#f72585] px-8 py-12 text-white shadow-xl shadow-pink-500/20 sm:px-12 sm:py-14">
          <Gamepad2
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -bottom-6 h-40 w-40 -rotate-12 text-white/15 transition-transform duration-500 hover:rotate-0"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-lg">
              <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                GAME MODE AVAILABLE
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Uji Kemampuan Disk Scheduling Kamu!
              </h2>
              <p className="mt-2.5 text-xs leading-relaxed text-pink-100 sm:text-sm">
                Tantang Diri Kamu dalam Mini Game Interaktif dan Buktikan
                Seberapa Cepat Kamu Menghitung Pergerakan Head Disk.
              </p>
            </div>

            <Link
              to="/minigame"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-[#ec008c] shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 sm:text-sm"
            >
              <Gamepad2 className="h-4 w-4" />
              Mainkan Mini Game
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}

export default LandingPage;
