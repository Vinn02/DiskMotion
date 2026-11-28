import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, Play, Gamepad2 } from "lucide-react";
import logo from "../assets/logo.svg";

const SECTION_ITEMS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "algorithm", label: "Algorithm" },
];

function Navbar({ isDarkMode, onToggleDarkMode }) {
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isManualScrollRef = useRef(false);
  const manualScrollTimerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isVisualizerPage = location.pathname === "/visualisasi";

  const ctaConfig = isVisualizerPage
    ? {
        to: "/minigame",
        label: "Mulai Mini Game",
        Icon: Gamepad2,
      }
    : {
        to: "/visualisasi",
        label: "Mulai Simulasi",
        Icon: Play,
      };

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      if (isManualScrollRef.current) return;

      if (window.scrollY < 80) {
        setActiveSection("home");
        return;
      }

      const triggerLine = window.innerHeight * 0.35;
      let currentId = SECTION_ITEMS[0].id;

      for (const item of SECTION_ITEMS) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            currentId = item.id;
          }
        }
      }

      setActiveSection(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (manualScrollTimerRef.current) {
        clearTimeout(manualScrollTimerRef.current);
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    isManualScrollRef.current = true;
    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }

    element.scrollIntoView({ behavior: "smooth" });

    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 800);
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  const CtaIcon = ctaConfig.Icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-[#f8f9fb]/85 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:grid md:grid-cols-3">
        {/* KOLOM 1: LOGO KIRI */}
        <div className="flex items-center justify-self-start">
          <Link
            to="/"
            onClick={() => handleSectionClick("home")}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
          >
            <img
              src={logo}
              alt="Disk Motion Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Disk Motion
            </span>
          </Link>
        </div>

        {/* KOLOM 2: MENU TENGAH */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-2 justify-self-center md:flex"
        >
          {SECTION_ITEMS.map((item) => {
            const isActive =
              location.pathname === "/" && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#ec008c] text-white shadow-sm shadow-pink-500/25"
                    : "text-slate-600 hover:text-[#ec008c] dark:text-slate-300 dark:hover:text-pink-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* KOLOM 3: CTA BUTTON, THEME ICON & MOBILE TOGGLE */}
        <div className="flex items-center gap-2.5 justify-self-end">
          <Link
            to={ctaConfig.to}
            onClick={() => setIsMobileMenuOpen(false)}
            className="dm-btn-shimmer inline-flex items-center gap-1.5 rounded-full bg-[#ec008c] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-pink-500/25 hover:-translate-y-0.5 hover:bg-[#ff149d] active:translate-y-0"
          >
            <CtaIcon
              className={`h-3.5 w-3.5 ${!isVisualizerPage ? "fill-current" : ""}`}
            />
            <span>{ctaConfig.label}</span>
          </Link>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100/70 text-[#ec008c] transition-colors hover:bg-pink-100 dark:bg-pink-500/15 dark:text-pink-400 dark:hover:bg-pink-500/25"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:text-[#ec008c] dark:text-slate-300 dark:hover:text-pink-400 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <nav className="border-t border-slate-200/70 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2">
            {SECTION_ITEMS.map((item) => {
              const isActive =
                location.pathname === "/" && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionClick(item.id)}
                  className={`rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#ec008c] text-white"
                      : "text-slate-600 hover:text-[#ec008c] dark:text-slate-300 dark:hover:text-pink-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
