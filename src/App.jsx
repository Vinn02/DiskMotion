import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Visualizer from "./pages/Visualizer";
import MiniGame from "./pages/MiniGame";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/visualisasi" element={<Visualizer />} />
          <Route path="/minigame" element={<MiniGame />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
