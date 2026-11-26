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
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import AmbientPageBackdrop, {
  CARD_SURFACE_CLASSES,
} from "../components/AmbientPageBackdrop";

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

function RevealSection({
  children,
  id,
  className = "",
  delay = 0,
  initialVisible = false,
  onVisibilityChange,
}) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (onVisibilityChange) {
          onVisibilityChange(visible);
        }
      },
      {
        threshold: 0.14,
        rootMargin: "-40px 0px -40px 0px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [onVisibilityChange]);

  return (
    <section
      id={id}
      ref={sectionRef}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-8 scale-[0.98] opacity-0"
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
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  return (
    <div className="overflow-x-clip bg-[#f8f9fb] text-slate-900 transition-colors duration-300 selection:bg-pink-100 selection:text-[#ec008c] dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-pink-500/20 dark:selection:text-pink-300">
      {/* HERO SECTION */}
      <RevealSection
        id="home"
        initialVisible={true}
        onVisibilityChange={setIsHeroVisible}
        className="relative isolate flex min-h-[540px] w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-28 text-center md:min-h-[600px] md:pt-32 md:pb-36"
      >
        <HeroBackground onVisibilityChange={setIsHeroVisible} />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
            Disk{" "}
            <span className="bg-gradient-to-r from-[#ec008c] via-pink-500 to-[#ff2a85] bg-clip-text text-transparent">
              Motion
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Pelajari algoritma disk scheduling dengan visualisasi real-time.
            Pahami FCFS, SSTF, SCAN, dan C-SCAN melalui simulasi interaktif
            &amp; minigame seru.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/visualisasi"
              className="dm-btn-shimmer group inline-flex items-center gap-2 rounded-full bg-[#ec008c] px-7 py-3 text-sm font-semibold text-white shadow-md shadow-pink-500/25 hover:-translate-y-0.5 hover:bg-[#ff149d] active:translate-y-0"
            >
              <Play className="h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110" />
              Mulai Simulasi
            </Link>

            <div
              className={`dm-btn-chase group hover:-translate-y-0.5 active:translate-y-0 ${
                !isHeroVisible ? "dm-paused" : ""
              }`}
            >
              <Link
                to="/minigame"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-[#ec008c] transition-colors duration-200 group-hover:bg-[#fff6fa] group-hover:text-[#ff0099] dark:bg-slate-900 dark:text-pink-300 dark:group-hover:bg-[#2a1433] dark:group-hover:text-pink-100"
              >
                <Gamepad2 className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                Mode Mini Game
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* AREA KONTEN BAWAH DENGAN AMBIENT BACKDROP */}
      <div className="relative isolate">
        <AmbientPageBackdrop variant="landing" />

        {/* FEATURES SECTION */}
        <RevealSection
          id="features"
          className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
        >
          <SectionBadge label="Features" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Semua Fitur yang Kamu Butuhkan
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES_DATA.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <article
                  key={feature.title}
                  className={`dm-hover-card group relative h-[138px] rounded-2xl p-4 ${CARD_SURFACE_CLASSES}`}
                >
                  <div className="relative z-10 h-full w-full">
                    {/* 1. Ikon (Posisi Awal): Presisi di tengah atas, memudar halus saat hover */}
                    <div className="pointer-events-none absolute top-[14px] left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-xl bg-pink-50 text-[#ec008c] opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0 dark:bg-pink-500/15 dark:text-pink-400">
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* 2. Judul + Ikon Samping (Terpusat): Bergeser halus ke atas dengan ikon muncul di samping judul */}
                    <h3 className="absolute top-[68px] left-1/2 flex w-full -translate-x-1/2 items-center justify-center text-center text-sm font-bold text-slate-800 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:top-[2px] group-hover:text-[15px] group-hover:text-[#ec008c] dark:text-slate-100 dark:group-hover:text-pink-400">
                      <span className="inline-flex max-w-0 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#ec008c] text-white opacity-0 shadow-sm shadow-pink-500/25 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mr-2 group-hover:h-6 group-hover:w-6 group-hover:max-w-[24px] group-hover:opacity-100 group-hover:delay-100">
                        <IconComponent className="h-3.5 w-3.5 shrink-0" />
                      </span>
                      <span className="truncate">{feature.title}</span>
                    </h3>

                    {/* 3. Keterangan: Muncul perlahan di bawah judul saat hover */}
                    <p className="pointer-events-none absolute top-[34px] right-0 left-0 text-center text-xs leading-relaxed text-slate-500 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-hover:delay-150 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </RevealSection>

        {/* ABOUT SECTION */}
        <RevealSection
          id="about"
          className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
        >
          <SectionBadge label="About" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Apa Itu Disk Motion / Disk Scheduling
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Mekanisme Sistem Operasi untuk menentukan urutan eksekusi permintaan
            Input/Output (I/O) pada piringan hard disk. Tujuannya adalah
            menghemat pergerakan head mekanis agar respons sistem menjadi
            secepat mungkin.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {METRICS_DATA.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <article
                  key={metric.title}
                  className={`dm-hover-card group flex items-center gap-4 rounded-2xl p-6 text-left ${CARD_SURFACE_CLASSES}`}
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ec008c] text-white shadow-sm shadow-pink-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#d1007b] group-hover:shadow-md group-hover:shadow-pink-500/35">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-slate-900 transition-colors duration-300 group-hover:text-[#ec008c] dark:text-slate-100 dark:group-hover:text-pink-400">
                      {metric.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">
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
          className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-24 text-center md:py-32"
        >
          <SectionBadge label="Algorithms" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Algoritma Utama yang Dipelajari
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ALGORITHMS_DATA.map((algo) => (
              <article
                key={algo.code}
                className={`dm-hover-card group relative h-[138px] rounded-2xl p-4 ${CARD_SURFACE_CLASSES}`}
              >
                <div className="relative z-10 h-full w-full">
                  {/* 1. Judul / Kode Algoritma: Presisi di tengah atas saat normal, bergeser ke kiri atas saat hover */}
                  <span className="absolute top-[6px] left-1/2 -translate-x-1/2 text-base font-extrabold tracking-wide text-[#ec008c] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:top-0 group-hover:left-0 group-hover:translate-x-0 group-hover:text-sm dark:text-pink-400">
                    {algo.code}
                  </span>

                  {/* 2. Kepanjangan Judul: Presisi di tengah vertikal kartu saat normal, memudar hilang saat hover */}
                  <h3 className="pointer-events-none absolute top-1/2 right-0 left-0 -translate-y-1/2 text-center text-xs font-bold leading-snug text-slate-800 opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0 dark:text-slate-100">
                    {algo.name}
                  </h3>

                  {/* 3a. Ciri Khas (Posisi Bawah Tengah): Memudar hilang perlahan saat hover */}
                  <span className="pointer-events-none absolute bottom-[6px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-pink-50 px-3 py-1 text-[10px] font-semibold text-[#ec008c] opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0 dark:bg-pink-500/15 dark:text-pink-300">
                    {algo.tag}
                  </span>

                  {/* 3b. Ciri Khas (Posisi Atas Sejajar Judul): Muncul perlahan sejajar di kanan atas */}
                  <span className="pointer-events-none absolute top-[1px] right-0 whitespace-nowrap rounded-full bg-[#ec008c] px-2.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-sm shadow-pink-500/25 transition-opacity duration-500 ease-out group-hover:opacity-100 group-hover:delay-150">
                    {algo.tag}
                  </span>

                  {/* 4. Keterangan Detail: Muncul perlahan di bawah judul & ciri khas */}
                  <p className="pointer-events-none absolute top-[30px] right-0 left-0 text-left text-xs leading-relaxed text-slate-500 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-hover:delay-150 dark:text-slate-300">
                    {algo.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </RevealSection>

        {/* MINI GAME CTA BANNER */}
        <RevealSection className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ff2a85] via-[#ec008c] to-[#f72585] px-8 py-12 text-white shadow-xl shadow-pink-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/35 sm:px-12 sm:py-14">
            <Gamepad2
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -bottom-6 h-40 w-40 -rotate-12 text-white/15 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-0"
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
                className="dm-btn-shimmer-light group/btn inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-[#ec008c] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff6fa] active:translate-y-0 sm:text-sm"
              >
                <Gamepad2 className="h-4 w-4 transition-transform duration-300 group-hover/btn:-rotate-12" />
                Mainkan Mini Game
              </Link>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}

export default LandingPage;
