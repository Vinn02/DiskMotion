import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Disc, Moon, Sun, Menu, X } from "lucide-react";

const SECTION_ITEMS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "algorithm", label: "Algorithm" },
];

const ROUTE_ITEMS = [
  { path: "/visualisasi", label: "Visualizer" },
  { path: "/minigame", label: "Mini Game" },
];

function Navbar({ isDarkMode, onToggleDarkMode }) {
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (const item of SECTION_ITEMS) {
        const element = document.getElementById(item.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-[#f8f9fb]/85 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:grid md:grid-cols-3">
        {/* KOLOM 1: LOGO KIRI */}
        <div className="flex items-center justify-self-start">
          <Link
            to="/"
            onClick={() => handleSectionClick("home")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ec008c] text-white shadow-sm shadow-pink-500/20">
              <Disc className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Disk Motion
            </span>
          </Link>
        </div>

        {/* KOLOM 2: MENU TENGAH */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-1.5 justify-self-center md:flex"
        >
          {SECTION_ITEMS.map((item) => {
            const isActive =
              location.pathname === "/" && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#ec008c] text-white shadow-sm shadow-pink-500/25"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <span
            className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700"
            aria-hidden="true"
          />

          {ROUTE_ITEMS.map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#ec008c] text-white shadow-sm shadow-pink-500/25"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        {/* KOLOM 3: THEME ICON & MOBILE TOGGLE */}
        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100/70 text-[#ec008c] transition-colors hover:bg-pink-100 dark:bg-pink-500/15 dark:text-pink-400 dark:hover:bg-pink-500/25"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
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
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <hr className="my-1 border-slate-200 dark:border-slate-800" />
            {ROUTE_ITEMS.map((route) => {
              const isActive = location.pathname === route.path;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#ec008c] text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {route.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
