import { getSound } from "./util";

export default class Reverb {
    public input: AudioNode;
    public output: AudioNode;

    private dry: GainNode;
    private wet: GainNode;
    private loaded: boolean;
    private onReadyCallbacks: Array<() => void>;

    constructor(context: AudioContext) {
        const convolver = context.createConvolver();
        this.input = context.createGain();
        this.output = context.createGain();
        this.wet = context.createGain();
        this.dry = context.createGain();
        this.loaded = false;

        this.input.connect(this.dry);
        this.dry.connect(this.output);
        this.input.connect(convolver);
        convolver.connect(this.wet);
        this.wet.connect(this.output);
        this.onReadyCallbacks = [];

        getSound(context, 'stalbans_a_ortf.wav')
            .then((audioBuffer) => {
                convolver.buffer = audioBuffer;
                this.loaded = true;
                this.onReadyCallbacks.forEach((callback) => callback());
                this.onReadyCallbacks = []; // we don't need these references anymore
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

    // TODO: Promise?
    public onLoad(callback: () => void): void {
        if (this.loaded) {
            callback();
        } else {
            this.onReadyCallbacks.push(callback);
        }
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}