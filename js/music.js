"use strict";

const music = {
  playing: false,
  levelIndex: -1,
  timer: null,
  step: 0,
  nextStepAt: 0,
  lookAhead: 0.12,

  songs: [
    {
      bpm: 112,
      leadType: "square",
      bassType: "triangle",
      lead: [60,64,67,64, 60,64,69,67, 65,69,67,64, 62,65,64,60],
      bass: [36,null,36,null, 41,null,43,null, 36,null,41,null, 43,null,36,null]
    },
    {
      bpm: 142,
      leadType: "square",
      bassType: "square",
      lead: [67,71,74,71, 69,72,76,72, 67,71,74,79, 76,74,72,71],
      bass: [43,43,47,47, 45,45,48,48, 43,43,47,47, 40,40,43,43]
    },
    {
      bpm: 96,
      leadType: "triangle",
      bassType: "sine",
      lead: [76,null,79,83, 79,null,76,74, 81,null,79,76, 74,null,71,76],
      bass: [40,null,40,null, 45,null,43,null, 40,null,45,null, 47,null,40,null]
    }
  ],

  midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  },

  scheduleNote(note, when, duration, type, volume) {
    if (note === null || note === undefined || !audio.context || !audio.master) return;
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(this.midiToFrequency(note), when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(gain);
    gain.connect(audio.master);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.03);
  },

  scheduleStep(step, when) {
    const song = this.songs[this.levelIndex];
    const eighthNote = 60 / song.bpm / 2;
    const leadNote = song.lead[step % song.lead.length];
    const bassNote = song.bass[step % song.bass.length];

    this.scheduleNote(leadNote, when, eighthNote * 0.82, song.leadType, 0.055);
    this.scheduleNote(bassNote, when, eighthNote * 0.72, song.bassType, 0.035);

    if (step % 4 === 0) {
      this.scheduleNote(leadNote === null ? null : leadNote + 12, when, eighthNote * 0.16, "square", 0.016);
    }
  },

  scheduler() {
    if (!this.playing || !audio.context) return;
    const song = this.songs[this.levelIndex];
    const stepDuration = 60 / song.bpm / 2;

    while (this.nextStepAt < audio.context.currentTime + this.lookAhead) {
      this.scheduleStep(this.step, this.nextStepAt);
      this.nextStepAt += stepDuration;
      this.step = (this.step + 1) % song.lead.length;
    }
  },

  play(levelIndex) {
    audio.init();
    if (!audio.context || !audio.enabled) return;
    const safeLevel = Math.max(0, Math.min(this.songs.length - 1, levelIndex));

    if (this.playing && this.levelIndex === safeLevel) return;
    this.stop();
    this.levelIndex = safeLevel;
    this.playing = true;
    this.step = 0;
    this.nextStepAt = audio.context.currentTime + 0.07;
    this.timer = window.setInterval(() => this.scheduler(), 35);
    this.scheduler();
  },

  stop() {
    this.playing = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.step = 0;
  },

  update(levelIndex, active) {
    if (!audio.enabled || !active) {
      if (this.playing) this.stop();
      return;
    }
    if (!this.playing || this.levelIndex !== levelIndex) this.play(levelIndex);
  }
};
