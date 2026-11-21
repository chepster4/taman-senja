// All sound is synthesised with WebAudio: no audio files, no network, just
// oscillators and a little envelope shaping. The bank stays silent until the
// first user gesture creates its AudioContext, and a mute toggle silences it.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, startAt, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    try {
      const now = this.ctx.currentTime + startAt;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } catch {
      // A headless run has no audio device; the game must never fail for it.
    }
  }

  /** A bright two-note chime when a difference is found. */
  playFind(combo) {
    const lift = Math.min(combo, 6) * 24;
    this.tone(660 + lift, 0, 0.16, 'sine', 0.22);
    this.tone(990 + lift, 0.09, 0.28, 'sine', 0.2);
    this.tone(1320 + lift, 0.16, 0.2, 'triangle', 0.08);
  }

  /** A soft low thud for a click that finds nothing. */
  playMiss() {
    this.tone(160, 0, 0.18, 'sine', 0.16, 90);
  }

  /** A shimmer when a hint reveals a difference. */
  playHint() {
    this.tone(880, 0, 0.12, 'sine', 0.12);
    this.tone(1174, 0.08, 0.12, 'sine', 0.12);
    this.tone(1568, 0.16, 0.2, 'sine', 0.1);
  }

  /** A rising arpeggio when a scene is cleared. */
  playSceneClear() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.24, 'triangle', 0.18));
  }

  /** The victory melody: a short major phrase. */
  playVictory() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.14, 0.3, 'triangle', 0.16));
  }

  /** A single tick when the timer drops under ten seconds. */
  playTick() {
    this.tone(1200, 0, 0.05, 'square', 0.05);
  }

  playClick() {
    this.tone(440, 0, 0.06, 'sine', 0.08);
  }
}
