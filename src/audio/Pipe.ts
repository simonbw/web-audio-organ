import { clamp, pitchToFrequency } from "./util";

export default class Pipe {
  public output: AudioNode;
  private gain: GainNode;
  private pitch: number;
  private playing: boolean;
  private maxGain: number;

  constructor(context: AudioContext, pitch: number, tremulator: AudioNode) {
    this.pitch = pitch;
    this.playing = false;
    this.maxGain = 0.1;

    this.gain = context.createGain(); // Main volume control
    this.gain.gain.value = 0;
    this.output = this.gain;

    // Creates the sound
    const oscillator = context.createOscillator();
    oscillator.frequency.value = pitchToFrequency(pitch);
    oscillator.setPeriodicWave(this.getPeriodicWave(context));

    // Tremelo
    const tremelo = context.createGain();
    const tremeloStrength = context.createGain();
    tremeloStrength.gain.value = 1.0;
    tremulator.connect(tremeloStrength);
    tremeloStrength.connect(tremelo.gain);

    // Vibrato
    const vibratoPitchStrength = context.createGain();
    vibratoPitchStrength.gain.value = 10.0;
    tremulator.connect(vibratoPitchStrength);
    // vibratoPitchStrength.connect(oscillator.detune); // causes stuttering for some reason

    // Left/Right pan
    const panner = context.createStereoPanner();
    panner.pan.value = clamp(this.pitch / 48, -1.0, 1.0);

    oscillator.connect(tremelo);
    oscillator.start();
    tremelo.connect(panner);
    panner.connect(this.gain);
  }

  /**
   * Construct the spectrum for the pipe.
   * @param context
   * @return {PeriodicWave}
   */
  private getPeriodicWave(context: AudioContext) {
    const NUMBER_OF_HARMONICS = 16;
    const EVEN_COEFFICIENT = 0.3;
    const DECAY = 3.5;

    const real = new Float32Array(NUMBER_OF_HARMONICS);
    const imag = new Float32Array(NUMBER_OF_HARMONICS);
    real[0] = 0;
    imag[0] = 0;
    for (let i = 1; i < NUMBER_OF_HARMONICS; i++) {
      if (i % 2 == 1) {
        real[i] = 1.0 / i ** DECAY;
      } else {
        real[i] = EVEN_COEFFICIENT / i ** DECAY;
      }
      imag[i] = 0;
    }
    // TODO: Chiff

    return context.createPeriodicWave(real, imag, {
      disableNormalization: true
    });
  }

  /**
   * @return {number} time to warm up
   */
  private getAttackLength(currentGain: number): number {
    const percent = clamp((this.pitch + 36) / 72, 0, 1.0) ** 1.5; // [0.0, 1.0]
    const maxLength = 0.2 / (1.0 + 19 * percent); // [0.01, 0.2]
    return (1.0 - currentGain / this.maxGain) * maxLength;
  }

  /**
   * @return {number} time to cool down
   */
  private getDecayLength(currentGain: number): number {
    const percent = clamp((this.pitch + 36) / 72, 0, 1.0) ** 1.5; // [0.0, 1.0]
    const maxLength = 0.5 / (1.0 + 19 * percent); // [0.025, 0.5]
    return currentGain / this.maxGain * maxLength;
  }

  public play() {
    if (!this.playing) {
      this.playing = true;
      console.log("pipe played");

      const now = this.output.context.currentTime;
      const currentGain = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(currentGain, now);
      this.gain.gain.linearRampToValueAtTime(
        this.maxGain,
        now + this.getAttackLength(currentGain)
      );
    }
  }

  public stop() {
    if (this.playing) {
      this.playing = false;
      console.log("pipe stopped");

      const now = this.output.context.currentTime;
      const currentGain = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(currentGain, now);
      this.gain.gain.linearRampToValueAtTime(
        0,
        now + this.getDecayLength(currentGain)
      );
    }
  }
}
