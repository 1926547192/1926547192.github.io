/* ============================================================
 * 《阙下归人》· 程序化音效（WebAudio，无需外部音频文件）
 * ------------------------------------------------------------
 * 全部音效用振荡器/噪声实时合成，音量克制。
 * 若你之后提供真人配音或 BGM，可在 main.js 中挂接替换。
 * ============================================================ */

const AudioFX = (() => {
  let ctx = null;
  let master = null;
  let muted = (() => { try { return localStorage.getItem('qxgr_muted') === '1'; } catch (e) { return false; } })();

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.5;
        master.connect(ctx.destination);
      } catch (e) { ctx = null; return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    const c = ensure(); if (!c || muted) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(master);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    } catch (e) {}
  }

  function noise(dur, vol, filterFreq, delay) {
    const c = ensure(); if (!c || muted) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq || 1200;
      const g = c.createGain(); g.gain.value = vol || 0.2;
      src.connect(f); f.connect(g); g.connect(master);
      src.start(t0);
    } catch (e) {}
  }

  return {
    unlock() { ensure(); },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('qxgr_muted', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : 0.5;
      return muted;
    },
    isMuted() { return muted; },

    click()   { tone(660, 0.06, 'triangle', 0.12); },
    advance() { tone(520, 0.05, 'triangle', 0.08); },
    typeTick() { tone(880, 0.02, 'sine', 0.02); },
    strike()  { noise(0.05, 0.12, 2600); },
    flame()   { noise(0.35, 0.14, 900); tone(220, 0.3, 'sine', 0.05, 160); },
    torch()   { noise(0.5, 0.2, 700); tone(140, 0.5, 'sawtooth', 0.04, 90); },
    whoosh()  { noise(0.4, 0.16, 600); },
    scare()   { tone(190, 0.7, 'sawtooth', 0.28, 55); noise(0.5, 0.3, 500); },
    gong()    { tone(98, 1.6, 'sine', 0.22, 60); tone(147, 1.2, 'sine', 0.08, 90); },
    collect() { tone(784, 0.1, 'sine', 0.16); tone(1046, 0.16, 'sine', 0.16, null, 0.09); },
    wrong()   { tone(160, 0.22, 'square', 0.12, 110); },
    hurt()    { tone(120, 0.3, 'sawtooth', 0.2, 60); noise(0.25, 0.2, 400); },
    success() { tone(523, 0.12, 'sine', 0.16); tone(659, 0.12, 'sine', 0.16, null, 0.1); tone(880, 0.3, 'sine', 0.18, null, 0.2); },
    droneStart() { tone(62, 6, 'sine', 0.05, 58); tone(93, 6, 'sine', 0.03, 87); },
    droneStop()  {},
  };
})();
