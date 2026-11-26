import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Visualizer from "./pages/Visualizer";
import MiniGame from "./pages/MiniGame";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!search) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}

function AppLayout({ isDarkMode, toggleDarkMode }) {
  const { pathname } = useLocation();
  const isMiniGame = pathname === "/minigame";

  useEffect(() => {
    const root = document.documentElement;
    if (isMiniGame) {
      root.classList.add("dm-lock-viewport");
    } else {
      root.classList.remove("dm-lock-viewport");
    }
    return () => root.classList.remove("dm-lock-viewport");
  }, [isMiniGame]);

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-[#f8f9fb] text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      <main
        className={
          isMiniGame
            ? "flex flex-1 flex-col overflow-x-clip"
            : "flex-1 overflow-x-clip"
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/visualisasi"
            element={<Visualizer isDarkMode={isDarkMode} />}
          />
          <Route
            path="/minigame"
            element={<MiniGame isDarkMode={isDarkMode} />}
          />
        </Routes>
      </main>
      {!isMiniGame && <Footer />}
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    if (isDarkMode) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.style.backgroundColor = "#020617";
      body.style.backgroundColor = "#020617";
      if (themeMeta) themeMeta.setAttribute("content", "#020617");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.style.backgroundColor = "#f8f9fb";
      body.style.backgroundColor = "#f8f9fb";
      if (themeMeta) themeMeta.setAttribute("content", "#f8f9fb");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </BrowserRouter>
  );
}

export default App;
