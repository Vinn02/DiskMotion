import { ALG, rnd } from "./engine";

export function getThemePalette(dark) {
  return {
    dark,
    bgTop: dark ? "#120610" : "#fff7fa",
    bgBottom: dark ? "#240a20" : "#fce4ee",
    rollLinePrefix: "rgba(236,72,153,",
    rollLineAlphaBase: dark ? 0.04 : 0.05,
    rollLineAlphaScale: dark ? 0.22 : 0.17,
    trackLine: dark ? "rgba(148,163,184,0.18)" : "rgba(219,39,119,0.16)",
    trackText: dark ? "#94a3b8" : "#9d174d",
    headBase: dark ? "#ec4899" : "#db2777",
    headBaseShadow: dark ? "#ec4899" : "rgba(236,72,153,0.45)",
    headBaseShadowBlur: dark ? 14 : 7,
    headFill: dark ? "#ec4899" : "#db2777",
    headFillShadow: dark ? "#ec4899" : "rgba(219,39,119,0.35)",
    headFillShadowBlur: dark ? 18 : 10,
    trailPrefix: dark ? "rgba(236,72,153," : "rgba(219,39,119,",
    hudAlgo: dark ? "#fdf2f8" : "#831843",
    hudSub: dark ? "#94a3b8" : "#9d174d",
    serviceDash: dark ? "rgba(255,255,255,0.75)" : "rgba(131,24,67,0.65)",
    serviceArc: dark ? "#ffffff" : "#db2777",
    progressFill: dark ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)",
  };
}

const colOf = (q, dark) => {
  const r = q.life / q.max;
  if (dark) return r > 0.5 ? "#4ade80" : r > 0.25 ? "#facc15" : "#f87171";
  return r > 0.5 ? "#16a34a" : r > 0.25 ? "#d97706" : "#dc2626";
};

const TOP = 44;

export function draw(X, S, { W, H, dark, algo }) {
  const LN = H - 54;
  const now = performance.now();
  const pal = getThemePalette(dark);

  const proj = (tr, p) => {
    const s = 0.32 + 0.68 * p;
    const sideMargin = Math.min(48, Math.max(16, W * 0.055));
    return {
      x: W / 2 + (tr / (S.N - 1) - 0.5) * (W - sideMargin * 2) * s,
      y: TOP + (LN - TOP) * p,
      s,
    };
  };

  X.save();
  if (S.shake > 0)
    X.translate(rnd(-1, 1) * S.shake * 14, rnd(-1, 1) * S.shake * 14);

  const bg = X.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, pal.bgTop);
  bg.addColorStop(1, pal.bgBottom);
  X.fillStyle = bg;
  X.fillRect(0, 0, W, H);

  X.lineWidth = 1;
  X.textAlign = "center";
  X.font = "10px monospace";

  const sc = (S.t * 0.8) % 10;
  for (let k = 0; k < 10; k++) {
    const p = ((k + sc) % 10) / 10;
    const a = proj(0, p),
      b = proj(S.N - 1, p);
    X.strokeStyle = `${pal.rollLinePrefix}${pal.rollLineAlphaBase + p * pal.rollLineAlphaScale})`;
    X.beginPath();
    X.moveTo(a.x, a.y);
    X.lineTo(b.x, b.y);
    X.stroke();
  }

  for (let i = 0; i <= 10; i++) {
    const tr = ((S.N - 1) * i) / 10;
    const a = proj(tr, 0),
      b = proj(tr, 1);
    X.strokeStyle = pal.trackLine;
    X.beginPath();
    X.moveTo(a.x, a.y);
    X.lineTo(b.x, b.y);
    X.stroke();
    X.fillStyle = pal.trackText;
    X.fillText("T" + Math.round(tr), b.x, LN + 34);
  }

  const L = proj(0, 1).x - 14;
  const R = proj(S.N - 1, 1).x + 14;
  const hx = proj(S.head, 1).x;
  X.shadowColor = pal.headBaseShadow;
  X.shadowBlur = pal.headBaseShadowBlur;
  X.strokeStyle = pal.headBase;
  X.lineWidth = 3;
  X.beginPath();
  X.moveTo(L, LN);
  X.lineTo(R, LN);
  X.stroke();
  X.shadowBlur = 0;

  const list = [...S.reqs].sort((a, b) => b.life / b.max - a.life / a.max);
  X.font = "bold 9px monospace";
  for (const q of list) {
    const p = Math.min(1, Math.max(0, 1 - q.life / q.max));
    const o = proj(q.track, p);
    const col = colOf(q, pal.dark);
    const urg = q.life < 2 && !(S.svc && S.svc.q === q);
    const r = (5 + 8 * o.s) * (urg ? 1 + 0.2 * Math.sin(now / 80) : 1);

    X.fillStyle = q.kit ? "#fff" : col;
    X.shadowColor = q.kit ? "#4ade80" : col;
    X.shadowBlur = urg ? (pal.dark ? 18 : 12) : pal.dark ? 8 : 4;
    X.beginPath();
    if (q.kit) X.rect(o.x - r, o.y - r, r * 2, r * 2);
    else X.arc(o.x, o.y, r, 0, Math.PI * 2);
    X.fill();
    X.shadowBlur = 0;

    if (q.kit) {
      X.fillStyle = "#15803d";
      X.fillRect(o.x - r * 0.6, o.y - r * 0.18, r * 1.2, r * 0.36);
      X.fillRect(o.x - r * 0.18, o.y - r * 0.6, r * 0.36, r * 1.2);
    }

    X.strokeStyle = col;
    X.lineWidth = 2.5;
    X.beginPath();
    X.arc(
      o.x,
      o.y,
      r + 5,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * (q.life / q.max),
    );
    X.stroke();

    if (o.s > 0.55 && !q.kit) {
      X.fillStyle = pal.dark ? "#1a0a16" : "#ffffff";
      X.fillText(q.track, o.x, o.y + 3);
    }
  }

  const prog = S.svc ? 1 - S.svc.left / Math.max(S.svc.total, 1e-6) : 0;
  if (S.svc) {
    const q = S.svc.q;
    const o = proj(q.track, 1 - q.life / q.max);
    X.strokeStyle = pal.serviceDash;
    X.lineWidth = 2;
    X.setLineDash([5, 4]);
    X.beginPath();
    X.moveTo(hx, LN);
    X.lineTo(o.x, o.y);
    X.stroke();
    X.setLineDash([]);
    X.strokeStyle = pal.serviceArc;
    X.lineWidth = 3;
    X.beginPath();
    X.arc(
      o.x,
      o.y,
      5 + 8 * o.s + 10,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * prog,
    );
    X.stroke();
  }

  for (const t of S.trail) {
    X.fillStyle = `${pal.trailPrefix}${t.a * 0.35})`;
    X.fillRect(proj(t.x, 1).x - 13, LN - 13, 26, 26);
  }

  X.shadowColor = pal.headFillShadow;
  X.shadowBlur = pal.headFillShadowBlur;
  X.fillStyle = pal.headFill;
  X.fillRect(hx - 13, LN - 13, 26, 26);
  X.shadowBlur = 0;
  X.fillStyle = pal.progressFill;
  X.fillRect(hx - 13, LN + 13 - 26 * prog, 26, 26 * prog);

  for (const p of S.parts) {
    X.fillStyle = p.col;
    X.globalAlpha = Math.max(0, p.a);
    X.fillRect(proj(p.tr, 1).x + p.dx - 2, LN + p.dy - 2, 4, 4);
  }

  X.textAlign = "center";
  X.font = "bold 13px monospace";
  for (const p of S.pops) {
    X.fillStyle = p.col;
    X.globalAlpha = Math.max(0, p.a);
    X.fillText(p.text, proj(p.tr, 1).x, LN - 26 - (1 - p.a) * 40);
  }
  X.globalAlpha = 1;

  for (const f of S.fx) {
    X.strokeStyle = `rgba(74,222,128,${f.a})`;
    X.lineWidth = 2;
    X.beginPath();
    X.arc(proj(f.tr, 1).x, LN, 12 + (1 - f.a) * 26, 0, Math.PI * 2);
    X.stroke();
  }

  if (S.flash > 0) {
    const alpha = pal.dark ? S.flash * 0.3 : S.flash * 0.18;
    X.fillStyle = `rgba(${S.flashC},${alpha})`;
    X.fillRect(0, 0, W, H);
  }

  X.textAlign = "left";
  X.fillStyle = pal.hudAlgo;
  X.font = "bold 13px monospace";
  X.fillText(
    ALG[algo] +
      (algo >= 3 ? (S.dir > 0 ? "  →" : "  ←") : "") +
      (S.paused ? " · PAUSED" : ""),
    16,
    26,
  );

  X.textAlign = "right";
  X.fillStyle = pal.hudSub;
  X.font = "10px monospace";
  X.fillText("▼ REQUEST INCOMING", W - 16, 26);

  X.restore();
}
