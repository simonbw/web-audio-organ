/**
 * A rank is a set of pipes.
 */
import Pipe from "./Pipe";

export default class Rank {
    public output: AudioNode;

    private pipes: { [pitch: number]: Pipe };
    private gain: GainNode;

    constructor(context: AudioContext, tremulator: AudioNode, offset: number, gainAmount: number) {
        this.gain = context.createGain();
        this.gain.gain.value = gainAmount;
        this.output = this.gain;

        this.pipes = {};
        for (let i = -1; i < 21; i++) {
            const pipe = new Pipe(context, i + offset, tremulator);
            pipe.output.connect(this.gain);
            this.pipes[i] = pipe;
        }
    }

    public setGainAmount(value: number): void {
        this.gain.gain.setTargetAtTime(value, this.gain.context.currentTime, 0.01);
    }

    public play(pitch: number): void {
        this.pipes[pitch].play();
    }

    public stop(pitch: number): void {
        this.pipes[pitch].stop();
    }

    public stopAll(): void {
        for (const pitch in this.pipes) {
            this.pipes[pitch].stop();
        }
    }
}