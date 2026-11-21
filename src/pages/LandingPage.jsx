import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="page-container">
      <h1>Disk Motion: Belajar Disk Scheduling</h1>
      <p>
        Pahami cara kerja algoritma penjadwalan disk (FCFS, SSTF, SCAN, C-SCAN)
        melalui simulasi visual dan tantangan interaktif.
      </p>
      <div className="action-buttons">
        <Link to="/visualisasi" className="btn-primary">
          Mulai Simulasi
        </Link>
        <Link to="/minigame" className="btn-secondary">
          Main Mini Game
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
