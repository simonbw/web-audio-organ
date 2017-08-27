export default class Reverb {
    public input: AudioNode;
    public output: AudioNode;

    constructor(context: AudioContext) {
        const input = this.input = context.createGain();
        const output = this.output = context.createGain();
        const dry = context.createGain();
        const wet = context.createGain();
        const center = context.createGain(); // The node that everything comes back to

        input.connect(dry);
        dry.connect(output);

        addWall(context, center, 13);
        addWall(context, center, 17);
        addWall(context, center, 29);
        addWall(context, center, 97);

        input.connect(center);
        center.connect(wet);
        wet.connect(output);

        dry.gain.value = 0.0;
        wet.gain.value = 1.0;
    }
}

function addWall(context: AudioContext, center: AudioNode, distance: number): void {
    const delayTime = 0.003 * distance;
    const delay = context.createDelay(delayTime);
    delay.delayTime.value = delayTime;

    const filter = context.createBiquadFilter();
    filter.type = 'highpass';

    const gain = context.createGain();
    gain.gain.value = 0.22;

    center.connect(delay);
    delay.connect(filter);
    filter.connect(gain);
    gain.connect(center);
}