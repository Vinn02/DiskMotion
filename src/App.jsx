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

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("diskmotion-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      localStorage.setItem("diskmotion-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      localStorage.setItem("diskmotion-theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-[#f8f9fb] text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Navbar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        <main className="flex-1">
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
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
