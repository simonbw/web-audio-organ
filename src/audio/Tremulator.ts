export default class Tremulator {
  public output: AudioNode;

  private gain: GainNode;
  private oscillator: OscillatorNode;

  constructor(context: AudioContext) {
    this.oscillator = context.createOscillator();
    this.oscillator.frequency.value = 3.0;
    this.oscillator.start();

    this.gain = context.createGain();
    this.gain.gain.value = 0.2;

    this.oscillator.connect(this.gain);
    this.output = this.gain;
  }

  public setAmplitude(value: number): void {
    this.gain.gain.value = value;
  }

  public setFrequency(value: number): void {
    this.oscillator.frequency.value = value;
  }

  public getAmplitude(): number {
    return this.gain.gain.value;
  }

  public getFrequency(): number {
    return this.oscillator.frequency.value;
  }
}
