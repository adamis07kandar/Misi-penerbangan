/**
 * Procedural Web Audio API sound synthesizer
 * Zero external audio file dependencies
 * Features realistic turboprop airplane audio + anti-aircraft gunfire / shot explosion audio
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private engineMasterGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineOscSub: OscillatorNode | null = null;
  private engineNoiseNode: AudioBufferSourceNode | null = null;
  private engineNoiseGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private propLFO: OscillatorNode | null = null;
  private propLFOGain: GainNode | null = null;
  private isMuted: boolean = false;
  private engineRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a 2-second looping white/pink noise buffer for wind and engine rush
   */
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  public startEngine() {
    if (this.engineRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.engineMasterGain = this.ctx.createGain();
      this.engineMasterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.045, now);

      // Low-pass filter for engine body
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(290, now);

      // LFO for propeller blade chop (28 Hz)
      this.propLFO = this.ctx.createOscillator();
      this.propLFO.type = 'sine';
      this.propLFO.frequency.setValueAtTime(28, now);

      this.propLFOGain = this.ctx.createGain();
      this.propLFOGain.gain.setValueAtTime(0.35, now);
      this.propLFO.connect(this.propLFOGain);

      // Main rumble - Sawtooth
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(68, now);

      // Harmonized detuned secondary osc - Triangle
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(136.5, now);

      // Deep sub-octave rumble - Sine
      this.engineOscSub = this.ctx.createOscillator();
      this.engineOscSub.type = 'sine';
      this.engineOscSub.frequency.setValueAtTime(34, now);

      // Wind & Propeller Wash Noise
      const noiseBuffer = this.createNoiseBuffer();
      if (noiseBuffer) {
        this.engineNoiseNode = this.ctx.createBufferSource();
        this.engineNoiseNode.buffer = noiseBuffer;
        this.engineNoiseNode.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(450, now);
        noiseFilter.Q.setValueAtTime(1.2, now);

        this.engineNoiseGain = this.ctx.createGain();
        this.engineNoiseGain.gain.setValueAtTime(0.015, now);

        this.engineNoiseNode.connect(noiseFilter);
        noiseFilter.connect(this.engineNoiseGain);
        this.engineNoiseGain.connect(this.engineMasterGain);
        this.engineNoiseNode.start(now);
      }

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineOscSub.connect(this.engineFilter);

      this.engineFilter.connect(this.engineMasterGain);
      this.engineMasterGain.connect(this.ctx.destination);

      this.engineOsc1.start(now);
      this.engineOsc2.start(now);
      this.engineOscSub.start(now);
      this.propLFO.start(now);

      this.engineRunning = true;
    } catch {
      // Audio might be waiting for user gesture
    }
  }

  public updateEnginePitch(pitchFactor: number) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineOscSub) return;
    const now = this.ctx.currentTime;
    const baseFreq = 65 + pitchFactor * 32;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.08);
    this.engineOscSub.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);

    if (this.propLFO) {
      this.propLFO.frequency.setTargetAtTime(26 + pitchFactor * 14, now, 0.08);
    }
  }

  public stopEngine() {
    if (!this.engineRunning) return;
    try {
      this.engineOsc1?.stop();
      this.engineOsc2?.stop();
      this.engineOscSub?.stop();
      this.propLFO?.stop();
      this.engineNoiseNode?.stop();

      this.engineOsc1?.disconnect();
      this.engineOsc2?.disconnect();
      this.engineOscSub?.disconnect();
      this.propLFO?.disconnect();
      this.engineNoiseNode?.disconnect();
      this.engineMasterGain?.disconnect();
    } catch {
      // ignore
    }
    this.engineRunning = false;
  }

  /**
   * Anti-aircraft gunfire, bullet ricochet & missile hit explosion sound
   * Triggered when player chooses the wrong answer!
   */
  public playPlaneShot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Triple rapid flak / anti-aircraft cannon bursts ("PHEW-PHEW-PHEW!")
    [0, 0.07, 0.15].forEach((delay, burstIndex) => {
      if (!this.ctx) return;
      const t = now + delay;

      // Laser / Tracer bullet drop
      const bulletOsc = this.ctx.createOscillator();
      const bulletGain = this.ctx.createGain();

      bulletOsc.type = burstIndex % 2 === 0 ? 'sawtooth' : 'square';
      bulletOsc.frequency.setValueAtTime(1400 - burstIndex * 200, t);
      bulletOsc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

      bulletGain.gain.setValueAtTime(0.28, t);
      bulletGain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);

      bulletOsc.connect(bulletGain);
      bulletGain.connect(this.ctx.destination);

      bulletOsc.start(t);
      bulletOsc.stop(t + 0.13);
    });

    // 2. Heavy hull impact explosion & metal impact crunch at t + 0.18
    const impactTime = now + 0.18;

    // Metallic hit ring
    const metalOsc = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();
    metalOsc.type = 'triangle';
    metalOsc.frequency.setValueAtTime(320, impactTime);
    metalOsc.frequency.exponentialRampToValueAtTime(80, impactTime + 0.35);

    metalGain.gain.setValueAtTime(0.35, impactTime);
    metalGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.35);

    metalOsc.connect(metalGain);
    metalGain.connect(this.ctx.destination);

    metalOsc.start(impactTime);
    metalOsc.stop(impactTime + 0.36);

    // Deep explosive blast noise
    const bufferSize = this.ctx.sampleRate * 0.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const blastFilter = this.ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(500, impactTime);
    blastFilter.frequency.exponentialRampToValueAtTime(90, impactTime + 0.45);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.4, impactTime);
    blastGain.gain.exponentialRampToValueAtTime(0.002, impactTime + 0.45);

    noiseSource.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.ctx.destination);

    noiseSource.start(impactTime);
    noiseSource.stop(impactTime + 0.5);

    // 3. Engine stall sputter sputter (drone dips for a moment)
    if (this.engineMasterGain && !this.isMuted) {
      this.engineMasterGain.gain.setValueAtTime(0.01, impactTime);
      this.engineMasterGain.gain.linearRampToValueAtTime(0.045, impactTime + 0.6);
    }
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.36);
    });
  }

  public playStageClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [440, 554.37, 659.25, 880];
    melody.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.46);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [1046.50, 1318.51, 1567.98]
    ];

    chords.forEach((chord, i) => {
      const time = now + i * 0.22;
      chord.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.61);
      });
    });
  }

  public playButtonClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playTouchdown() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Tire chirp / rubber squeak
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.engineMasterGain) {
      const now = this.ctx.currentTime;
      this.engineMasterGain.gain.setValueAtTime(muted ? 0 : 0.045, now);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new AudioSynthesizer();
