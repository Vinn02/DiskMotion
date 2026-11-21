import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">Disk Motion</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/visualisasi">Visualisasi</Link>
        <Link to="/minigame">Mini Game</Link>
      </div>
    </nav>
  );
}

export default Navbar;
