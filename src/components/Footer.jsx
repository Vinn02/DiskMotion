import { Link, useLocation, useNavigate } from "react-router-dom";
import { Disc } from "lucide-react";

const FOOTER_LINKS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "algorithm", label: "Algorithm" },
];

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleFooterNav = (sectionId) => {
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
    <footer className="relative z-20 border-t border-slate-200/80 bg-[#eef0f4] text-slate-600 transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <h2 className="text-lg font-extrabold leading-snug text-slate-900 dark:text-white">
              Pahami Disk Scheduling Melalui
              <br />
              <span className="text-[#ec008c] dark:text-pink-400">
                Simulasi Interaktif &amp; Minigame Seru
              </span>
            </h2>
          </div>

          <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Interactive Disk Scheduling Simulator &amp; Learning Hub untuk
            mempermudah pemahaman Operating System Concepts.
          </p>
        </div>

        <hr className="my-8 border-slate-300/70 dark:border-slate-800" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            to="/"
            onClick={() => handleFooterNav("home")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ec008c] text-white">
              <Disc className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              Disk Motion
            </span>
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-6 text-xs font-medium"
          >
            {FOOTER_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleFooterNav(item.id)}
                className="transition-colors hover:text-[#ec008c] dark:hover:text-pink-400"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500">
          © 2026 Disk Motion. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
