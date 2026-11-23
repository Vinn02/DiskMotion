export const ALG = ["", "FCFS", "SSTF", "SCAN", "C-SCAN"];

export const DESC = [
  "",
  "FCFS: Melayani sesuai urutan masuk. Adil & sederhana, tapi boros pergerakan head saat beban tinggi.",
  "SSTF: Bergerak ke request terdekat. Sangat cepat membersihkan antrean terpusat, namun request di track jauh berisiko starvation.",
  "SCAN: Menyapu satu arah seperti lift, lalu berbalik arah saat track di depan kosong. Mencegah starvation.",
  "C-SCAN: Menyapu hanya ke satu arah tetap (menuju track tertinggi), lalu melompat instan ke track 0. Menjaga waktu tunggu tetap seragam.",
];

export const MAX_QUEUE = 30;

export const DEFAULT_SETTINGS = {
  mode: "endless",
  N: "200",
  rate: "0.7",
  pmin: "5",
  pmax: "10",
  svcT: "0.25",
};

export const rnd = (a, b) => a + Math.random() * (b - a);

export function readConfig(s) {
  const svc = parseFloat(s.svcT);
  const c = {
    N: Math.max(50, Math.min(500, +s.N || 200)),
    rate: Math.max(0.2, Math.min(5, +s.rate || 0.8)),
    pmin: Math.max(3, +s.pmin || 5),
    pmax: Math.max(4, +s.pmax || 10),
    svcT: Math.max(0, Math.min(2, !isNaN(svc) ? svc : 0.25)),
  };
  if (c.pmax < c.pmin) c.pmax = c.pmin;
  return c;
}

export function newState(settings = DEFAULT_SETTINGS) {
  const c = readConfig(settings);
  return {
    ...c,
    mode: settings.mode || "endless",
    head: c.N / 2,
    dir: 1,
    reqs: [],
    fx: [],
    health: 100,
    score: 0,
    mult: 1,
    streak: 0,
    thm: 0,
    served: 0,
    starved: 0,
    wait: 0,
    t: 0,
    next: 0.5,
    bq: [],
    parts: [],
    pops: [],
    trail: [],
    shake: 0,
    burst: 0,
    flash: 0,
    flashC: "",
    alertT: 0,
    alert: false,
    running: false,
    paused: false,
    over: false,
    overReason: "",
    id: 0,
    svc: null,
  };
}

function spawn(S) {
  const N = S.N;
  let tr;
  if (S.mode === "far") {
    tr = Math.random() < 0.85 ? rnd(0, N * 0.2) : rnd(N * 0.88, N - 1);
  } else {
    tr = rnd(0, N - 1);
  }
  const max = rnd(S.pmin, S.pmax);
  S.reqs.push({
    id: S.id++,
    track: Math.round(tr),
    ang: rnd(0, Math.PI * 2),
    max,
    life: max,
    born: S.t,
    kit: S.health < 100 && Math.random() < 0.12,
  });
}

const nearest = (list, h) =>
  list.reduce((a, b) => (Math.abs(a.track - h) <= Math.abs(b.track - h) ? a : b));

function pick(S, algo) {
  const r = S.reqs, h = S.head;
  if (!r.length) return null;
  if (algo === 1) return r.reduce((a, b) => (a.born <= b.born ? a : b));
  if (algo === 2) return nearest(r, h);
  if (algo === 3) {
    for (let k = 0; k < 2; k++) {
      const f = r.filter((q) => (q.track - h) * S.dir >= 0);
      if (f.length) return nearest(f, h);
      S.dir *= -1;
    }
    return null;
  }
  const f = r.filter((q) => q.track >= h);
  if (f.length) return nearest(f, h);
  S.thm += h;
  S.head = 0;
  S.dir = 1;
  S.flash = 0.35;
  S.flashC = "236,72,153";
  return nearest(r, 0);
}

function pop(S, tr, text, col) {
  S.pops.push({ tr, text, col, a: 1 });
}

function burst(S, tr, col, n) {
  for (let i = 0; i < n; i++) {
    S.parts.push({
      tr,
      col,
      dx: 0,
      dy: 0,
      vx: rnd(-110, 110),
      vy: rnd(-190, -30),
      a: 1,
    });
  }
}

function finish(S, q, sfx) {
  S.reqs = S.reqs.filter((r) => r !== q);
  S.fx.push({ tr: q.track, a: 1 });
  S.served++;
  S.wait += S.t - q.born;
  if (q.kit) {
    S.health = Math.min(100, S.health + 12);
    pop(S, q.track, "+12 HP", "#4ade80");
    burst(S, q.track, "#4ade80", 18);
    sfx.beep(660, 0.12);
    return;
  }
  const pts = 10 * S.mult;
  S.score += pts;
  S.streak++;
  if (S.streak % 5 === 0) S.mult = Math.min(5, S.mult + 1);
  pop(S, q.track, "+" + pts, "#ec4899");
  burst(S, q.track, "#f472b6", 12);
}

function endGame(S, reason) {
  S.over = true;
  S.running = false;
  S.overReason = reason;
}

export function update(S, rawDt, algo, speedMul, sfx) {
  const dt = rawDt * speedMul;
  S.t += dt;

  let rate = S.rate;
  if (S.mode === "endless") rate = Math.min(2.2, S.rate + S.t * 0.008);
  if (S.mode === "burst") {
    rate = S.rate * 0.5;
    S.burst += dt;
    if (S.burst >= 8) {
      S.burst = 0;
      const n = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) S.bq.push(rnd(0.05, 2.5));
    }
  }

  const qn = S.reqs.length;
  if (qn < 3) rate *= 2;
  else if (qn > 14) rate *= 0.4;

  S.bq = S.bq.map((w) => w - dt).filter((w) => {
    if (w <= 0) {
      spawn(S);
      return false;
    }
    return true;
  });

  S.next -= dt;
  while (S.next <= 0) {
    spawn(S);
    S.next += Math.min(3 / rate, Math.max(0.1, -Math.log(1 - Math.random()) / rate));
  }

  if (S.svc) {
    S.svc.left -= dt;
    if (S.svc.left <= 0) {
      finish(S, S.svc.q, sfx);
      S.svc = null;
    }
  } else {
    const tg = pick(S, algo);
    if (tg) {
      const d = tg.track - S.head;
      const mv = Math.min(Math.abs(d), S.N * 0.22 * dt);
      S.head += Math.sign(d) * mv;
      S.thm += mv;
      if (algo >= 3 && d !== 0) S.dir = Math.sign(d);
      if (Math.abs(tg.track - S.head) < 1e-6) {
        S.head = tg.track;
        const q = S.reqs
          .filter((r) => r.track === tg.track)
          .reduce((a, b) => (a.born <= b.born ? a : b));
        if (S.svcT <= 0) finish(S, q, sfx);
        else S.svc = { q, left: S.svcT, total: S.svcT };
      }
    }
  }

  let minLife = 99;
  S.reqs = S.reqs.filter((q) => {
    if (S.svc && S.svc.q === q) return true;
    q.life -= dt;
    if (q.life <= 0) {
      if (q.kit) return false;
      S.health = Math.max(0, S.health - 10);
      S.starved++;
      S.mult = 1;
      S.streak = 0;
      S.flash = 0.5;
      S.flashC = "248,113,113";
      S.shake = 0.45;
      pop(S, q.track, "TIMEOUT", "#f87171");
      sfx.beep(140, 0.25);
      return false;
    }
    if (!q.kit) minLife = Math.min(minLife, q.life);
    return true;
  });

  S.alert = minLife < 2;
  if (S.alert) {
    S.alertT -= rawDt;
    if (S.alertT <= 0) {
      sfx.beep(880, 0.08);
      S.alertT = 0.7;
    }
  }

  S.fx.forEach((f) => (f.a -= rawDt * 2.5));
  S.fx = S.fx.filter((f) => f.a > 0);

  for (const p of S.parts) {
    p.dx += p.vx * rawDt;
    p.dy += p.vy * rawDt;
    p.vy += 420 * rawDt;
    p.a -= rawDt * 1.5;
  }
  S.parts = S.parts.filter((p) => p.a > 0);

  S.pops.forEach((p) => (p.a -= rawDt * 0.9));
  S.pops = S.pops.filter((p) => p.a > 0);

  S.trail.push({ x: S.head, a: 1 });
  S.trail.forEach((t) => (t.a -= rawDt * 3));
  S.trail = S.trail.filter((t) => t.a > 0);

  S.shake = Math.max(0, S.shake - rawDt);
  S.flash = Math.max(0, S.flash - rawDt);

  if (S.health <= 0) endGame(S, "DISK TIMEOUT / SYSTEM FREEZE");
  else if (S.reqs.length >= MAX_QUEUE) endGame(S, "DISK CRASH: antrean I/O meluap (≥ 30)");
}