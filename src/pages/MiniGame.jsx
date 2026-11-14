import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ALG = ["", "FCFS", "SSTF", "SCAN", "C-SCAN"];

const DESC = [
  "",
  "FCFS: Melayani sesuai urutan masuk. Adil & sederhana, tapi boros pergerakan head saat beban tinggi.",
  "SSTF: Bergerak ke request terdekat. Sangat cepat membersihkan antrean terpusat, namun request di track jauh berisiko starvation.",
  "SCAN: Menyapu satu arah seperti lift, lalu berbalik arah saat track di depan kosong. Mencegah starvation.",
  "C-SCAN: Menyapu hanya ke satu arah tetap (menuju track tertinggi), lalu melompat instan ke track 0. Menjaga waktu tunggu tetap seragam.",
];

const MAX_QUEUE = 30;
const SPEEDS = [1, 1.5, 2];

const DEFAULT_SETTINGS = {
  mode: "endless",
  N: "200",
  rate: "0.7",
  pmin: "5",
  pmax: "10",
  svcT: "0.25",
};

const HUD = {
  hp: 100, score: 0, mult: 1, thm: 0, aw: "0.0",
  qn: 0, served: 0, starved: 0, best: 0, alert: false,
};

function MiniGame() {
  const [algo, setAlgo] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [form, setForm] = useState(DEFAULT_SETTINGS);

  const over = null;

  const hud = HUD;

  const startGame = () => {
    setPaused(false);
    setPhase("playing");
  };

  const togglePause = () => {
    if (phase !== "playing") return;
    setPaused((p) => !p);
  };

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        setAlgo(+e.key);
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (tag === "BUTTON") e.target.blur();
        setPaused((p) => (phase === "playing" ? !p : p));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const hpColor = hud.hp > 60 ? "#4ade80" : hud.hp > 30 ? "#facc15" : "#f87171";
  const qnColor = hud.qn >= 24 ? "#f87171" : hud.qn >= 18 ? "#facc15" : undefined;

  return (
    <div className="dtc-page">
      <div className="dtc-head">
        <Link to="/" className="dtc-btn dtc-back" aria-label="Kembali ke halaman utama">
          &lt;
        </Link>
        <div>
          <h2 className="dtc-title">Disk Traffic Controller</h2>
          <p className="dtc-sub">
            Jadilah kernel OS: pilih algoritma disk scheduling yang tepat sebelum antrean I/O meluap.
          </p>
        </div>
      </div>

      <div className="dtc-layout">
        <section className="dtc-panel dtc-box" aria-label="Area permainan">
          {hud.alert && phase === "playing" && (
            <div className="dtc-starvation-alert dtc-bl" role="alert">
              ⚠ STARVATION ALERT: request &lt; 2 detik!
            </div>
          )}

          <div className="dtc-stage">
            <canvas aria-label="Visualisasi disk head dan antrean request" />

            {phase !== "playing" && (
              <div className="dtc-ov dtc-modal-backdrop">
                <div className="dtc-modal">
                  {phase === "over" && over ? (
                    <>
                      <h2 className="dtc-modal-title">GAME OVER</h2>
                      <div className="dtc-modal-body">
                        <p className="dtc-bad dtc-reason">{over.reason}</p>
                        <div className="dtc-over-grid">
                          <span className="dtc-mut">Skor Akhir</span>
                          <b>{over.score}{over.best && " 🏆 Rekor baru!"}</b>
                          <span className="dtc-mut">Request Dilayani</span>
                          <b>{over.served}</b>
                          <span className="dtc-mut">Starved (Timeout)</span>
                          <b className="dtc-bad">{over.starved}</b>
                          <span className="dtc-mut">Total Head Movement</span>
                          <b>{over.thm} track</b>
                          <span className="dtc-mut">Rata-rata Latensi</span>
                          <b>{over.avg}s</b>
                          <span className="dtc-mut">Waktu Bertahan</span>
                          <b>{over.time}s</b>
                        </div>
                      </div>
                      <button type="button" className="dtc-btn dtc-btn-primary dtc-modal-btn" onClick={startGame}>
                        Main Lagi 🔄
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="dtc-modal-title">DISK TRAFFIC CONTROLLER</h2>
                      <div className="dtc-modal-body">
                        <p className="dtc-intro-p">
                          Kamu bertindak sebagai kernel Sistem Operasi. Request I/O berdatangan secara
                          real-time dan disk head melayani track sesuai algoritma aktif.
                        </p>
                        <ul className="dtc-list">
                          <li>Ganti algoritma saat berjalan dengan tombol <b>1, 2, 3, 4</b>.</li>
                          <li>
                            Request bergerak menuju garis head (hijau → kuning → merah). Sampai garis
                            sebelum dilayani = <b className="dtc-bad">Timeout (-10 HP)</b>.
                          </li>
                          <li>
                            Layanan berturut-turut akan melipatgandakan skor (hingga{" "}
                            <b className="dtc-pink">x5 Multiplier</b>).
                          </li>
                          <li>
                            <b>Medkit</b> (kotak bertanda +): Ambil untuk memulihkan{" "}
                            <b className="dtc-ok">+12 HP</b>!
                          </li>
                          <li>Health 0% atau antrean meluap (≥ {MAX_QUEUE}) = Game Over.</li>
                        </ul>
                      </div>
                      <button type="button" className="dtc-btn dtc-btn-primary dtc-modal-btn" onClick={startGame}>
                        Mulai Bermain 🚀
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="dtc-legend" aria-hidden="true">
            <span><i className="dtc-dot" style={{ background: "#4ade80" }} />Aman</span>
            <span><i className="dtc-dot" style={{ background: "#facc15" }} />Waspada</span>
            <span><i className="dtc-dot" style={{ background: "#f87171" }} />Kritis</span>
            <span>
              <i className="dtc-dot dtc-sq" style={{ background: "#fff", borderColor: "#4ade80" }} />
              Medkit +12 HP
            </span>
            <span className="dtc-legend-keys">
              <kbd>1</kbd>–<kbd>4</kbd> algoritma · <kbd>Spasi</kbd> pause
            </span>
          </div>
        </section>

        <aside className="dtc-side">
          <div className="dtc-panel dtc-card">
            <div className="dtc-row dtc-row-between">
              <span className="dtc-lbl">Disk Health</span>
              <b className="dtc-hp-val">{hud.hp}%</b>
            </div>
            <div className="dtc-hpbar">
              <div style={{ width: hud.hp + "%", background: hpColor }} />
            </div>

            <div className="dtc-grid dtc-grid-2">
              <div className="dtc-stat-box">
                <span className="dtc-lbl">Score</span>
                <b className="dtc-big dtc-neon">{hud.score}</b>
              </div>
              <div className="dtc-stat-box">
                <span className="dtc-lbl">Multiplier</span>
                <b className="dtc-big dtc-mult">x{hud.mult}</b>
              </div>
            </div>

            <div className="dtc-grid dtc-grid-3">
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Queue</span>
                <b style={{ color: qnColor }}>{hud.qn}/{MAX_QUEUE}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Served</span>
                <b className="dtc-ok">{hud.served}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Starved</span>
                <b className="dtc-bad">{hud.starved}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">THM</span>
                <b>{hud.thm}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Avg Wait</span>
                <b>{hud.aw}s</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Best</span>
                <b className="dtc-warn">{hud.best}</b>
              </div>
            </div>
          </div>

          <div className="dtc-panel dtc-card">
            <div className="dtc-row dtc-row-between">
              <span className="dtc-lbl">Algoritma Disk</span>
              <span className="dtc-hint">Hotkey 1–4</span>
            </div>
            <div className="dtc-algos">
              {[1, 2, 3, 4].map((a) => (
                <button
                  key={a}
                  type="button"
                  className={"dtc-ab" + (algo === a ? " on" : "")}
                  onClick={() => setAlgo(a)}
                >
                  <b>{a}</b>
                  {ALG[a]}
                </button>
              ))}
            </div>
            <p className="dtc-algo-desc" aria-live="polite">{DESC[algo]}</p>
          </div>

          <div className="dtc-panel dtc-card">
            <div className="dtc-row">
              <button type="button" className="dtc-bt dtc-grow" onClick={togglePause}>
                {paused ? "▶ Resume (Spasi)" : "⏸ Pause (Spasi)"}
              </button>
              <button type="button" className="dtc-bt" title="Mulai ulang" onClick={startGame}>
                ↻ Restart
              </button>
              <button type="button" className="dtc-bt" title="Nyalakan / matikan musik" onClick={toggleMute}>
                {muted ? "🔇" : "🔊"} Musik
              </button>
            </div>
            <div className="dtc-row dtc-row-between dtc-speed">
              <span className="dtc-lbl">Kecepatan</span>
              <div className="dtc-row dtc-tight">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={"dtc-bt" + (speed === s ? " on" : "")}
                    onClick={() => setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <details className="dtc-panel dtc-set">
            <summary>
              <span>⚙ Pengaturan Simulasi</span>
              <i aria-hidden="true">▾</i>
            </summary>
            <div className="dtc-set-body">
              <label className="dtc-field">
                <span className="dtc-lbl">Mode</span>
                <select className="dtc-in" value={form.mode} onChange={setField("mode")}>
                  <option value="endless">Endless Survival</option>
                  <option value="burst">Challenge: Heavy Burst Workload</option>
                  <option value="far">Challenge: Far Track Isolation</option>
                </select>
              </label>
              <div className="dtc-grid dtc-grid-2">
                <label className="dtc-field">
                  <span className="dtc-lbl">Total Track</span>
                  <input className="dtc-in" type="number" min="50" max="500" value={form.N} onChange={setField("N")} />
                </label>
                <label className="dtc-field">
                  <span className="dtc-lbl">Request/detik</span>
                  <input className="dtc-in" type="number" step="0.1" min="0.2" max="5" value={form.rate} onChange={setField("rate")} />
                </label>
                <label className="dtc-field">
                  <span className="dtc-lbl">Patience min (s)</span>
                  <input className="dtc-in" type="number" min="3" value={form.pmin} onChange={setField("pmin")} />
                </label>
                <label className="dtc-field">
                  <span className="dtc-lbl">Patience max (s)</span>
                  <input className="dtc-in" type="number" min="4" value={form.pmax} onChange={setField("pmax")} />
                </label>
                <label className="dtc-field dtc-span-2">
                  <span className="dtc-lbl">Service time/request (s)</span>
                  <input className="dtc-in" type="number" step="0.05" min="0" max="2" value={form.svcT} onChange={setField("svcT")} />
                </label>
              </div>
              <p className="dtc-hint dtc-set-note">
                Berlaku saat Start/Restart. Antrean ≥ {MAX_QUEUE} = Disk Crash.
              </p>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}

export default MiniGame;