import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Target,
  Zap,
  Flame,
  Crosshair,
  Shield,
  Cpu,
  HardDrive,
} from "lucide-react";
import {
  ALG,
  DESC,
  MAX_QUEUE,
  DEFAULT_SETTINGS,
  newState,
  update,
} from "../utils/game/engine";
import { draw } from "../utils/game/renderer";
import { createAudio } from "../utils/game/audio";
import {
  loadAchievements,
  saveAchievements,
  resetAchievements,
} from "../utils/game/achievements";
import "./MiniGame.css";

const MODE_BRIEFINGS = {
  endless: {
    title: "Mode Endless Escalation",
    desc: "Intensitas request meningkat bertahap seiring waktu berjalan.",
    action:
      "Mulai dengan SSTF saat antrean padat, lalu pindah ke SCAN/C-SCAN saat pinggiran mulai menumpuk.",
  },
  burst: {
    title: "Mode Burst Wave",
    desc: "Setiap 8 detik terjadi lonjakan 5–7 request secara mendadak.",
    action:
      "Gunakan SCAN atau C-SCAN untuk menyapu gelombang antrean secara teratur tanpa starvation.",
  },
  far: {
    title: "Mode Far-Track Trap",
    desc: "85% request muncul di track bawah (0–20%) dan 15% di ujung atas (>88%).",
    action:
      "Hindari memakai SSTF terlalu lama! Pindah ke SCAN/C-SCAN untuk menyelamatkan track jauh.",
  },
};

const ACHIEVEMENT_ICONS = {
  target: Target,
  zap: Zap,
  flame: Flame,
  crosshair: Crosshair,
  shield: Shield,
  trophy: Trophy,
  cpu: Cpu,
  "hard-drive": HardDrive,
};

function renderAchievementIcon(iconKey) {
  const IconComp = ACHIEVEMENT_ICONS[iconKey] || Trophy;
  return <IconComp className="h-4 w-4 text-[#ec008c]" />;
}

export default function MiniGame({ isDarkMode = false }) {
  const canvasRef = useRef(null);
  const centerZoneRef = useRef(null);
  const stateRef = useRef(null);
  const audioRef = useRef(null);
  const algoRef = useRef(2); // Default: SSTF
  const speedRef = useRef(1);
  const darkRef = useRef(isDarkMode);
  const toastTimerRef = useRef(null);

  const [selectedAlgo, setSelectedAlgo] = useState(2);
  const [speedMul, setSpeedMul] = useState(1);
  const [muted, setMuted] = useState(false);

  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS);
  const [appliedSettings, setAppliedSettings] = useState(DEFAULT_SETTINGS);

  const [achievements, setAchievements] = useState(() => loadAchievements());
  const [toastAch, setToastAch] = useState(null);

  const [hud, setHud] = useState({
    score: 0,
    mult: 1,
    health: 100,
    thm: 0,
    served: 0,
    starved: 0,
    queueLen: 0,
    avgWait: 0,
    head: 100,
    level: 1,
    running: false,
    paused: false,
    over: false,
    overReason: "",
    alert: false,
    streak: 0,
    maxStreak: 0,
    elapsed: 0,
  });

  useEffect(() => {
    darkRef.current = isDarkMode;
  }, [isDarkMode]);

  useEffect(() => {
    algoRef.current = selectedAlgo;
  }, [selectedAlgo]);

  useEffect(() => {
    speedRef.current = speedMul;
  }, [speedMul]);

  // Main Engine, Audio & Canvas Animation Loop (inisialisasi ref dilakukan di dalam effect)
  useEffect(() => {
    if (stateRef.current == null) {
      stateRef.current = newState(DEFAULT_SETTINGS);
    }
    if (audioRef.current == null) {
      audioRef.current = createAudio(() => stateRef.current, false);
    }

    let rafId = null;
    let lastTime = performance.now();
    let hudAccumulator = 0;

    const triggerToast = (ach) => {
      setToastAch(ach);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setToastAch(null);
      }, 3400);
    };

    const evaluateAchievements = (S) => {
      const level = Math.min(6, 1 + Math.floor(S.t / 22));
      const checks = {
        first_blood: S.served >= 1,
        combo_5: S.streak >= 5 || S.maxStreak >= 5,
        combo_12: S.streak >= 12 || S.maxStreak >= 12,
        zero_seek: S.zeroSeekCount >= 1,
        vip_saver: S.vipRescued >= 1,
        score_5000: S.score >= 5000,
        level_4: level >= 4,
        served_30: S.served >= 30,
      };

      setAchievements((prev) => {
        let changed = false;
        let newlyUnlocked = null;

        const next = prev.map((item) => {
          if (!item.unlocked && checks[item.id]) {
            changed = true;
            newlyUnlocked = {
              ...item,
              unlocked: true,
              unlockedAt: Date.now(),
            };
            return newlyUnlocked;
          }
          return item;
        });

        if (changed) {
          saveAchievements(next);
          if (newlyUnlocked) {
            triggerToast(newlyUnlocked);
            audioRef.current?.beep(980, 0.14);
          }
          return next;
        }
        return prev;
      });
    };

    const syncHud = (S) => {
      const level = Math.min(6, 1 + Math.floor(S.t / 22));
      setHud({
        score: S.score,
        mult: S.mult,
        health: Math.round(S.health),
        thm: Math.round(S.thm),
        served: S.served,
        starved: S.starved,
        queueLen: S.reqs.length,
        avgWait: S.served > 0 ? S.wait / S.served : 0,
        head: Math.round(S.head),
        level,
        running: S.running,
        paused: S.paused,
        over: S.over,
        overReason: S.overReason,
        alert: S.alert,
        streak: S.streak,
        maxStreak: S.maxStreak,
        elapsed: Math.floor(S.t),
      });
    };

    const tick = (now) => {
      const rawDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const S = stateRef.current;
      const canvas = canvasRef.current;

      if (S && canvas) {
        if (S.running && !S.paused && !S.over) {
          update(S, rawDt, algoRef.current, speedRef.current, audioRef.current);
          evaluateAchievements(S);
        }

        const parent = canvas.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = Math.max(1, Math.floor(rect.width * dpr));
          const targetH = Math.max(1, Math.floor(rect.height * dpr));

          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          let safeZone = null;
          if (centerZoneRef.current) {
            const cz = centerZoneRef.current.getBoundingClientRect();
            safeZone = {
              left: cz.left - rect.left,
              right: cz.right - rect.left,
            };
          }

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.save();
            ctx.scale(dpr, dpr);
            draw(ctx, S, {
              W: rect.width,
              H: rect.height,
              dark: darkRef.current,
              algo: algoRef.current,
              safeZone,
            });
            ctx.restore();
          }
        }

        hudAccumulator += rawDt;
        if (hudAccumulator >= 0.08 || S.over) {
          hudAccumulator = 0;
          syncHud(S);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    audioRef.current?.unlock();
    const fresh = newState(appliedSettings);
    fresh.running = true;
    stateRef.current = fresh;
    setHud((prev) => ({
      ...prev,
      score: 0,
      mult: 1,
      health: 100,
      thm: 0,
      served: 0,
      starved: 0,
      queueLen: 0,
      avgWait: 0,
      head: Math.round(fresh.head),
      level: 1,
      running: true,
      paused: false,
      over: false,
      overReason: "",
      alert: false,
      streak: 0,
      maxStreak: 0,
      elapsed: 0,
    }));
  };

  const handleTogglePause = () => {
    const S = stateRef.current;
    if (!S || !S.running || S.over) return;
    audioRef.current?.unlock();
    S.paused = !S.paused;
    setHud((prev) => ({ ...prev, paused: S.paused }));
  };

  const handleToggleMute = () => {
    audioRef.current?.unlock();
    setMuted((prev) => {
      const next = !prev;
      audioRef.current?.setMuted(next);
      return next;
    });
  };

  const handleApplySettings = (e) => {
    e.preventDefault();
    setAppliedSettings(draftSettings);
    const fresh = newState(draftSettings);
    stateRef.current = fresh;
    setHud((prev) => ({
      ...prev,
      score: 0,
      mult: 1,
      health: 100,
      thm: 0,
      served: 0,
      starved: 0,
      queueLen: 0,
      avgWait: 0,
      head: Math.round(fresh.head),
      level: 1,
      running: false,
      paused: false,
      over: false,
      overReason: "",
      alert: false,
    }));
  };

  // Keyboard Shortcuts: 1-4 Algorithm, Space Pause, R Restart, M Mute
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      if (e.key === "1") setSelectedAlgo(1);
      else if (e.key === "2") setSelectedAlgo(2);
      else if (e.key === "3") setSelectedAlgo(3);
      else if (e.key === "4") setSelectedAlgo(4);
      else if (e.code === "Space") {
        e.preventDefault();
        const S = stateRef.current;
        if (!S || !S.running || S.over) {
          audioRef.current?.unlock();
          const fresh = newState(appliedSettings);
          fresh.running = true;
          stateRef.current = fresh;
          setHud((prev) => ({
            ...prev,
            score: 0,
            mult: 1,
            health: 100,
            thm: 0,
            served: 0,
            starved: 0,
            queueLen: 0,
            avgWait: 0,
            head: Math.round(fresh.head),
            level: 1,
            running: true,
            paused: false,
            over: false,
            overReason: "",
            alert: false,
            streak: 0,
            maxStreak: 0,
            elapsed: 0,
          }));
        } else {
          audioRef.current?.unlock();
          S.paused = !S.paused;
          setHud((prev) => ({ ...prev, paused: S.paused }));
        }
      } else if (e.key === "r" || e.key === "R") {
        audioRef.current?.unlock();
        const fresh = newState(appliedSettings);
        fresh.running = true;
        stateRef.current = fresh;
        setHud((prev) => ({
          ...prev,
          score: 0,
          mult: 1,
          health: 100,
          thm: 0,
          served: 0,
          starved: 0,
          queueLen: 0,
          avgWait: 0,
          head: Math.round(fresh.head),
          level: 1,
          running: true,
          paused: false,
          over: false,
          overReason: "",
          alert: false,
          streak: 0,
          maxStreak: 0,
          elapsed: 0,
        }));
      } else if (e.key === "m" || e.key === "M") {
        audioRef.current?.unlock();
        setMuted((prev) => {
          const next = !prev;
          audioRef.current?.setMuted(next);
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [appliedSettings]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const isLocked = hud.running && !hud.over;
  const activeBrief =
    MODE_BRIEFINGS[draftSettings.mode] || MODE_BRIEFINGS.endless;

  const hpBarColor =
    hud.health > 50 ? "#10b981" : hud.health > 25 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="dtc-fullscreen"
      data-dtc-theme={isDarkMode ? "dark" : "light"}
    >
      {/* FULL-SCREEN CANVAS STAGE */}
      <div className="dtc-bg-stage">
        <canvas ref={canvasRef} />
      </div>

      {/* FLOATING 3-COLUMN HUD */}
      <div className="dtc-hud-grid">
        {/* LEFT COLUMN: Brand, Telemetry & Legend */}
        <aside className="dtc-col">
          {/* Brand Header Card */}
          <div className="dtc-panel dtc-brand-card">
            <div className="dtc-row dtc-row-between">
              <div className="dtc-row">
                <Link
                  to="/"
                  title="Kembali ke Beranda"
                  className="dtc-btn dtc-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="dtc-brand-text">
                  <h1 className="dtc-title">Disk Traffic Controller</h1>
                  <p className="dtc-sub">
                    Kendalikan algoritma penjadwalan disk secara real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health & Score Telemetry */}
          <div className="dtc-panel dtc-card">
            <div className="dtc-row dtc-row-between">
              <span className="dtc-lbl">System Integrity</span>
              <span
                className={`dtc-hp-val ${
                  hud.health > 50
                    ? "dtc-ok"
                    : hud.health > 25
                      ? "dtc-warn"
                      : "dtc-bad"
                }`}
              >
                {hud.health}%
              </span>
            </div>
            <div className="dtc-hpbar">
              <div
                style={{
                  width: `${hud.health}%`,
                  background: hpBarColor,
                }}
              />
            </div>

            <div className="dtc-grid dtc-grid-2">
              <div className="dtc-stat-box">
                <span className="dtc-lbl">Score</span>
                <b className="dtc-big dtc-neon">{hud.score.toLocaleString()}</b>
              </div>
              <div className="dtc-stat-box">
                <span className="dtc-lbl">Multiplier</span>
                <b className="dtc-big dtc-mult">{hud.mult}x</b>
              </div>
            </div>

            <div className="dtc-grid dtc-grid-3">
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Served</span>
                <b className="dtc-ok">{hud.served}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Timeout</span>
                <b className="dtc-bad">{hud.starved}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Queue</span>
                <b className={hud.queueLen >= 22 ? "dtc-bad" : ""}>
                  {hud.queueLen}/{MAX_QUEUE}
                </b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">THM</span>
                <b>{hud.thm}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Head Pos</span>
                <b>T{hud.head}</b>
              </div>
              <div className="dtc-stat-box dtc-sm">
                <span className="dtc-lbl">Level</span>
                <b className="dtc-pink">LVL {hud.level}</b>
              </div>
            </div>
          </div>

          {/* Visual Legend & Hotkeys */}
          <div className="dtc-panel dtc-card">
            <span className="dtc-lbl">Indikator &amp; Shortcut</span>
            <div className="dtc-legend-items">
              <span>
                <i className="dtc-dot" style={{ background: "#4ade80" }} />
                Aman (&gt;50% TTL)
              </span>
              <span>
                <i className="dtc-dot" style={{ background: "#facc15" }} />
                Waspada (25–50%)
              </span>
              <span>
                <i className="dtc-dot" style={{ background: "#f87171" }} />
                Kritis (&lt;25% TTL)
              </span>
              <span>
                <i
                  className="dtc-dot dtc-sq"
                  style={{ background: "#ffffff", borderColor: "#4ade80" }}
                />
                Repair Kit (+12 HP)
              </span>
            </div>

            <div className="dtc-legend-keys">
              <span>
                <kbd>1</kbd>–<kbd>4</kbd> Algoritma
              </span>
              <span>
                <kbd>Space</kbd> Jeda
              </span>
              <span>
                <kbd>R</kbd> Ulang
              </span>
              <span>
                <kbd>M</kbd> Audio
              </span>
            </div>
          </div>
        </aside>

        {/* CENTER PLAYFIELD ZONE (Canvas Transparent + Overlays) */}
        <section ref={centerZoneRef} className="dtc-center-zone">
          {/* Starvation Alert Banner */}
          {hud.alert && hud.running && !hud.paused && !hud.over && (
            <div className="dtc-starvation-alert dtc-bl">
              ⚠ STARVATION WARNING: Request hampir timeout! Segera sapu jalur!
            </div>
          )}

          {/* Achievement Unlock Toast */}
          {toastAch && (
            <div
              className="dtc-ach-toast"
              style={{ top: hud.alert ? "2.8rem" : "0.5rem" }}
            >
              <span className="dtc-ach-toast-icon">
                {renderAchievementIcon(toastAch.icon)}
              </span>
              <div className="dtc-ach-toast-text">
                <span className="dtc-ach-toast-tag">ACHIEVEMENT UNLOCKED</span>
                <b>{toastAch.title}</b>
              </div>
            </div>
          )}

          {/* Intro / Game Over Modal */}
          {(!hud.running || hud.over) && (
            <div className="dtc-modal-wrap">
              <div className="dtc-modal">
                {!hud.over ? (
                  <>
                    <h2 className="dtc-modal-title">Disk Traffic Controller</h2>
                    <div className="dtc-modal-body">
                      <p className="dtc-intro-p">
                        Kamu adalah <b>Disk I/O Scheduler</b>. Ganti algoritma
                        penjadwalan secara dinamis untuk melayani seluruh
                        request sebelum batas waktunya habis!
                      </p>
                      <ul className="dtc-list">
                        <li>
                          Gunakan tombol <b>1–4</b> untuk berpindah antara{" "}
                          <b>FCFS, SSTF, SCAN,</b> dan <b>C-SCAN</b>.
                        </li>
                        <li>
                          <b>SSTF</b> sangat cepat untuk jarak dekat, tetapi
                          rawan membuat request di ujung mengalami{" "}
                          <b>starvation</b>.
                        </li>
                        <li>
                          Ambil kotak <b>Repair Kit (+)</b> untuk memulihkan{" "}
                          <b>+12% System Integrity</b>.
                        </li>
                        <li>
                          Permainan berakhir jika Integrity mencapai <b>0%</b>{" "}
                          atau antrean mencapai <b>{MAX_QUEUE} request</b>.
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="dtc-btn dtc-btn-primary dtc-modal-btn"
                    >
                      Mulai Simulasi Game
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="dtc-modal-title">SYSTEM HALTED</h2>
                    <div className="dtc-modal-body">
                      <p className="dtc-reason dtc-bad">{hud.overReason}</p>
                      <div className="dtc-over-grid">
                        <div className="dtc-stat-box">
                          <span className="dtc-lbl">Final Score</span>
                          <b className="dtc-pink">
                            {hud.score.toLocaleString()}
                          </b>
                        </div>
                        <div className="dtc-stat-box">
                          <span className="dtc-lbl">Requests Served</span>
                          <b className="dtc-ok">{hud.served}</b>
                        </div>
                        <div className="dtc-stat-box">
                          <span className="dtc-lbl">Total Head Movement</span>
                          <b>{hud.thm} cyl</b>
                        </div>
                        <div className="dtc-stat-box">
                          <span className="dtc-lbl">Max Streak</span>
                          <b>{hud.maxStreak}x</b>
                        </div>
                      </div>

                      {unlockedCount > 0 && (
                        <div className="dtc-over-ach">
                          <span className="dtc-lbl">
                            Unlocked Badges ({unlockedCount}/
                            {achievements.length})
                          </span>
                          <div className="dtc-over-ach-list">
                            {achievements
                              .filter((a) => a.unlocked)
                              .map((a) => (
                                <span key={a.id} className="dtc-over-ach-pill">
                                  ★ {a.title}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="dtc-btn dtc-btn-primary dtc-modal-btn"
                    >
                      Main Lagi
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Algorithm Switcher, Playback, Settings & Achievements */}
        <aside className="dtc-col">
          {/* Active Algorithm Switcher */}
          <div className="dtc-panel dtc-card">
            <div className="dtc-row dtc-row-between">
              <span className="dtc-lbl">Scheduler Algorithm</span>
              <span className="dtc-hint">Hotkey 1–4</span>
            </div>

            <div className="dtc-algos">
              {[1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAlgo(idx)}
                  className={`dtc-ab ${selectedAlgo === idx ? "on" : ""}`}
                >
                  <b>{idx}</b>
                  <span>{ALG[idx]}</span>
                </button>
              ))}
            </div>

            <p className="dtc-algo-desc">{DESC[selectedAlgo]}</p>

            {/* Playback & Speed Controls */}
            <div className="dtc-speed">
              <div className="dtc-row dtc-tight">
                <button
                  type="button"
                  onClick={
                    !hud.running || hud.over
                      ? handleStartGame
                      : handleTogglePause
                  }
                  className="dtc-bt dtc-grow inline-flex items-center justify-center gap-1.5"
                >
                  {!hud.running || hud.over ? (
                    <>
                      <Play className="h-3.5 w-3.5" /> Start
                    </>
                  ) : hud.paused ? (
                    <>
                      <Play className="h-3.5 w-3.5" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartGame}
                  title="Restart"
                  className="dtc-bt inline-flex items-center justify-center"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  title={muted ? "Unmute" : "Mute"}
                  className="dtc-bt inline-flex items-center justify-center"
                >
                  {muted ? (
                    <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </button>
              </div>

              <div className="dtc-row dtc-tight mt-2">
                <span className="dtc-lbl mr-1">Speed:</span>
                {[0.75, 1, 1.5, 2].map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpeedMul(sp)}
                    className={`dtc-bt dtc-grow ${speedMul === sp ? "on" : ""}`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scenario & Workload Settings Accordion */}
          <details className="dtc-panel dtc-set">
            <summary>
              <span>Scenario &amp; Parameters</span>
              <i>▼</i>
            </summary>
            <form onSubmit={handleApplySettings} className="dtc-set-body">
              {isLocked && (
                <div className="dtc-lock-notice">
                  Parameter terkunci saat sesi berlangsung. Klik &ldquo;Terapkan
                  &amp; Reset&rdquo; untuk memulai ulang dengan pengaturan baru.
                </div>
              )}

              <label className="dtc-field">
                <span className="dtc-lbl">Skenario Beban Kerja</span>
                <select
                  value={draftSettings.mode}
                  onChange={(e) =>
                    setDraftSettings((s) => ({ ...s, mode: e.target.value }))
                  }
                  className="dtc-in"
                >
                  <option value="endless">Endless Escalation</option>
                  <option value="burst">Burst Wave (Lonjakan)</option>
                  <option value="far">Far-Track Trap (Starvation Test)</option>
                </select>
              </label>

              <div className="dtc-mode-brief">
                <div className="dtc-mode-brief-head">{activeBrief.title}</div>
                <p className="dtc-mode-brief-desc">{activeBrief.desc}</p>
                <p className="dtc-mode-brief-act">
                  <b>Strategi:</b> {activeBrief.action}
                </p>
              </div>

              <div className="dtc-grid dtc-grid-2">
                <label className="dtc-field">
                  <span className="dtc-lbl">Total Track (50–500)</span>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    disabled={isLocked}
                    value={draftSettings.N}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, N: e.target.value }))
                    }
                    className="dtc-in"
                  />
                </label>

                <label className="dtc-field">
                  <span className="dtc-lbl">Arrival Rate (/s)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="5"
                    disabled={isLocked}
                    value={draftSettings.rate}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, rate: e.target.value }))
                    }
                    className="dtc-in"
                  />
                </label>

                <label className="dtc-field">
                  <span className="dtc-lbl">Min TTL (detik)</span>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    disabled={isLocked}
                    value={draftSettings.pmin}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, pmin: e.target.value }))
                    }
                    className="dtc-in"
                  />
                </label>

                <label className="dtc-field">
                  <span className="dtc-lbl">Max TTL (detik)</span>
                  <input
                    type="number"
                    min="4"
                    max="40"
                    disabled={isLocked}
                    value={draftSettings.pmax}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, pmax: e.target.value }))
                    }
                    className="dtc-in"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="dtc-btn dtc-btn-primary dtc-set-apply"
              >
                Terapkan &amp; Reset Sesi
              </button>
            </form>
          </details>

          {/* Achievements Accordion */}
          <details className="dtc-panel dtc-set">
            <summary>
              <span>
                Achievements ({unlockedCount}/{achievements.length})
              </span>
              <i>▼</i>
            </summary>
            <div className="dtc-set-body">
              <div className="dtc-ach-list">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`dtc-ach-item ${ach.unlocked ? "unlocked" : ""}`}
                  >
                    <span className="dtc-ach-icon">
                      {renderAchievementIcon(ach.icon)}
                    </span>
                    <div className="dtc-ach-info">
                      <b>{ach.title}</b>
                      <p>{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {unlockedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setAchievements(resetAchievements())}
                  className="dtc-bt mt-2.5 w-full text-center text-[11px] text-rose-400"
                >
                  Reset Progress Achievement
                </button>
              )}
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
