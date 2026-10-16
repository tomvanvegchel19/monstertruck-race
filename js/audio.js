"use strict";

const audio = {
  context: null,
  master: null,
  engineOscillator: null,
  engineGain: null,
  enabled: true,

  init() {
    if (!this.enabled) return;
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
  },

  tone(frequency, duration, options = {}) {
    if (!this.enabled) return;
    this.init();
    if (!this.context) return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = options.type || "square";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (options.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFrequency), now + duration);

    const volume = options.volume ?? 0.16;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  },

  noise(duration = 0.18, volume = 0.12) {
    if (!this.enabled) return;
    this.init();
    if (!this.context) return;

    const sampleCount = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, sampleCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index++) data[index] = Math.random() * 2 - 1;

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 950;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  },

  jump() {
    this.tone(185, 0.22, { type: "square", endFrequency: 520, volume: 0.13 });
    setTimeout(() => this.tone(420, 0.09, { type: "triangle", endFrequency: 620, volume: 0.08 }), 95);
  },

  shoot() {
    this.tone(170, 0.19, { type: "sawtooth", endFrequency: 760, volume: 0.12 });
    this.noise(0.08, 0.07);
  },

  explosion() {
    this.noise(0.34, 0.2);
    this.tone(105, 0.32, { type: "sawtooth", endFrequency: 42, volume: 0.14 });
  },

  collision() {
    this.noise(0.22, 0.15);
    this.tone(145, 0.27, { type: "square", endFrequency: 55, volume: 0.14 });
  },

  heart() {
    [523, 659, 784].forEach((frequency, index) => {
      setTimeout(() => this.tone(frequency, 0.16, { type: "triangle", volume: 0.11 }), index * 90);
    });
  },

  checkpoint() {
    [392, 523, 659].forEach((frequency, index) => {
      setTimeout(() => this.tone(frequency, 0.18, { type: "square", volume: 0.09 }), index * 105);
    });
  },

  levelComplete() {
    [523, 659, 784, 1047].forEach((frequency, index) => {
      setTimeout(() => this.tone(frequency, 0.22, { type: "triangle", volume: 0.12 }), index * 125);
    });
  },

  gameOver() {
    [330, 277, 220, 165].forEach((frequency, index) => {
      setTimeout(() => this.tone(frequency, 0.28, { type: "square", volume: 0.1 }), index * 155);
    });
  },

  startEngine() {
    this.init();
    if (!this.context || this.engineOscillator) return;
    this.engineOscillator = this.context.createOscillator();
    this.engineGain = this.context.createGain();
    this.engineOscillator.type = "sawtooth";
    this.engineOscillator.frequency.value = 52;
    this.engineGain.gain.value = 0.026;
    this.engineOscillator.connect(this.engineGain);
    this.engineGain.connect(this.master);
    this.engineOscillator.start();
  },

  updateEngine(speedIndex, active) {
    if (!this.context || !this.engineOscillator || !this.engineGain) return;
    const now = this.context.currentTime;
    const targetFrequency = 48 + speedIndex * 17;
    this.engineOscillator.frequency.setTargetAtTime(targetFrequency, now, 0.07);
    this.engineGain.gain.setTargetAtTime(active && this.enabled ? 0.022 + speedIndex * 0.005 : 0.0001, now, 0.08);
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this.master) this.master.gain.value = this.enabled ? 0.22 : 0;
    return this.enabled;
  }
};

