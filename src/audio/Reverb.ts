import { getSound } from "./util";

export default class Reverb {
    public input: AudioNode;
    public output: AudioNode;

    private dry: GainNode;
    private wet: GainNode;
    private loaded: boolean;

    constructor(context: AudioContext, wetAmount: number = 1.0) {
        const convolver = context.createConvolver();
        this.input = context.createGain();
        this.output = context.createGain();
        this.wet = context.createGain();
        this.dry = context.createGain();
        this.loaded = true;

        this.input.connect(this.dry);
        this.dry.connect(this.output);
        this.input.connect(convolver);
        convolver.connect(this.wet);
        this.wet.connect(this.output);

        getSound(context, 'stalbans_a_ortf.wav')
            .then(audioBuffer => {
                convolver.buffer = audioBuffer;
                this.loaded = true;
                this.setWet(wetAmount);
            }).catch((error) => console.error(error));

        this.setWet(0.0);
    }

    public setWet(value: number): void {
        if (this.loaded) {
            const context = this.wet.context;
            this.wet.gain.setTargetAtTime(Math.sqrt(value), context.currentTime, 0.01);
            this.dry.gain.setTargetAtTime(Math.sqrt(1.0 - value), context.currentTime, 0.01);
        }
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}