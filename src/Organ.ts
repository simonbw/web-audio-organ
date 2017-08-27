import { pitchToFrequency, clamp } from './util';

// TODO: Don't have so many oscillators all the time. And figure out other ways to reduce computation.

/**
 * An organ is a collection of ranks.
 */
export default class Organ {
    private ranks: Array<Rank>;
    public output: AudioNode;
    private activeRanks: Array<Rank>;

    constructor(context: AudioContext) {
        const gain = this.output = context.createGain();
        gain.gain.value = 0.1;

        const tremulatorOscillator = context.createOscillator();
        tremulatorOscillator.frequency.value = 3.0;
        tremulatorOscillator.start();
        const tremulatorStrength = context.createGain();
        tremulatorOscillator.connect(tremulatorStrength);
        tremulatorStrength.gain.value = 0.2;

        this.activeRanks = [];
        this.ranks = [];
        this.ranks.push(new Rank(context, tremulatorStrength, -36, 2.0));
        this.ranks.push(new Rank(context, tremulatorStrength, -24, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, -12, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, 0, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, 12, 0.7));
        this.ranks.push(new Rank(context, tremulatorStrength, 24, 0.5));
        // this.ranks.push(new Rank(context, tremulatorStrength, 36));
        this.ranks.forEach((rank) => rank.output.connect(this.output))
    }

    public isRankActive(rankIndex: number): boolean {
        this.validateRank(rankIndex);
        return this.activeRanks.indexOf(this.ranks[rankIndex]) >= 0;
    }

    public toggleRank(rankIndex: number): void {
        if (!this.isRankActive(rankIndex)) {
            this.activateRank(rankIndex);
        } else {
            this.deactivateRank(rankIndex);
        }
    }

    public activateRank(rankIndex: number): void {
        this.validateRank(rankIndex);
        const rank = this.ranks[rankIndex];
        if (this.activeRanks.indexOf(rank) == -1) {
            this.activeRanks.push(rank);
            console.log(`Activate rank ${rankIndex}`);
        }
    }

    public activateRanks(...rankIndexes: Array<number>) {
        rankIndexes.forEach((rankIndex) => this.activateRank(rankIndex));
    }

    public deactivateRanks(...rankIndexes: Array<number>) {
        rankIndexes.forEach((rankIndex) => this.deactivateRank(rankIndex));
    }

    public deactivateRank(rankIndex: number): void {
        this.validateRank(rankIndex);
        const rank = this.ranks[rankIndex];
        const activeRankIndex = this.activeRanks.indexOf(rank);
        if (activeRankIndex != -1) {
            this.activeRanks.splice(activeRankIndex, 1);
            console.log(`Deactivate rank ${rankIndex}`);
            rank.stopAll();
        }
    }

    private validateRank(rankIndex: number): void {
        if (rankIndex < 0 || rankIndex >= this.ranks.length) {
            throw new RangeError(`Invalid Rank: ${rankIndex}`)
        }
    }

    public play(pitch: number): void {
        this.activeRanks.forEach((rank) => {
            rank.play(pitch);
        });
    }

    public stop(pitch: number): void {
        this.activeRanks.forEach((rank) => {
            rank.stop(pitch);
        });
    }
}

/**
 * A rank is a set of pipes.
 */
class Rank {
    private pipes: { [pitch: number]: Pipe };
    public output: AudioNode;

    constructor(context: AudioContext, tremulator: AudioNode, offset: number, gainAmount: number) {
        const gain = context.createGain();
        gain.gain.value = gainAmount;
        this.output = gain;

        this.pipes = {};
        for (let i = -1; i < 20; i++) {
            const pipe = new Pipe(context, i + offset, tremulator);
            pipe.output.connect(gain);
            this.pipes[i] = pipe;
        }
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

class Pipe {
    public output: AudioNode;
    private gain: GainNode;
    private pitch: number;
    private highpass: BiquadFilterNode;
    private playing: boolean;
    private maxGain: number;

    constructor(context: AudioContext, pitch: number, tremulator: AudioNode) {
        this.pitch = pitch;
        this.playing = false;
        this.maxGain = 0.1;

        this.gain = context.createGain(); // Main volume control
        this.gain.gain.value = 0;
        this.output = this.gain;

        this.highpass = context.createBiquadFilter();

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

        oscillator.connect(tremelo);
        oscillator.start();

        // tremelo.connect(this.highpass); // causes stuttering for some reason
        // this.highpass.connect(this.gain);
        tremelo.connect(this.gain);
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
                real[i] = 1.0 / (i ** DECAY);
            } else {
                real[i] = EVEN_COEFFICIENT / (i ** DECAY);
            }
            imag[i] = 0;
        }
        // TODO: Chiff

        return context.createPeriodicWave(real, imag, {disableNormalization: true});
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
        return (currentGain / this.maxGain) * maxLength;
    }

    public play() {
        if (!this.playing) {
            this.playing = true;
            console.log('pipe played');

            const now = this.output.context.currentTime;
            const currentGain = this.gain.gain.value;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(currentGain, now);
            this.gain.gain.linearRampToValueAtTime(this.maxGain, now + this.getAttackLength(currentGain));
        }
    }

    public stop() {
        if (this.playing) {
            this.playing = false;
            console.log('pipe stopped');

            const now = this.output.context.currentTime;
            const currentGain = this.gain.gain.value;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(currentGain, now);
            this.gain.gain.linearRampToValueAtTime(0, now + this.getDecayLength(currentGain));
        }
    }
}
