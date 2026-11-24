const CH = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]];
const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function createAudio(getState, initialMuted = false) {
  let ctx = null;
  let master = null;
  let timer = null;
  let muted = initialMuted;
  let nextT = 0;
  let step = 0;

  function tone(t, f, d, type, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + d + 0.02);
  }

  function noise(t, d, vol) {
    const n = Math.floor(ctx.sampleRate * d);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const a = buf.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), g = ctx.createGain(), h = ctx.createBiquadFilter();
    h.type = "highpass";
    h.frequency.value = 7000;
    s.buffer = buf;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(h);
    h.connect(g);
    g.connect(master);
    s.start(t);
  }

  function sched() {
    if (!ctx || !master) return;
    const S = getState();
    if (!S || !S.running || S.paused || muted) {
      nextT = ctx.currentTime + 0.05;
      return;
    }
    const sp = 60 / (100 + Math.min(40, S.reqs.length * 3)) / 4;
    while (nextT < ctx.currentTime + 0.25) {
      const ch = CH[Math.floor(step / 16) % 4], k = step % 16;
      if (k % 4 === 0) tone(nextT, 62, 0.16, "sine", 0.55);
      if (k % 2 === 1) noise(nextT, 0.04, 0.1);
      if (k % 2 === 0) tone(nextT, mf(ch[0] - 12), sp * 1.8, "triangle", 0.22);
      tone(nextT, mf(ch[(k * 3) % 4] + 12), sp * 1.4, "square", 0.035);
      nextT += sp;
      step++;
    }
  }

  return {
    unlock() {
      if (!ctx) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
          ctx = null;
        }
      }
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      if (!master) {
        master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);
      }
      nextT = ctx.currentTime + 0.1;
      step = 0;
      if (!timer) timer = setInterval(sched, 80);
    },

    beep(f, d) {
      if (!ctx || muted) return;
      try {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f;
        o.type = "square";
        g.gain.value = 0.04;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + d);
      } catch {
      
      }
    },

    setMuted(m) {
      muted = m;
    },

    dispose() {
      if (timer) clearInterval(timer);
      timer = null;
      if (ctx) ctx.close().catch(() => {});
      ctx = null;
      master = null;
    },
  };
}
