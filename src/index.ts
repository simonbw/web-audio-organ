import { loadSound } from './util';
import { Visualizer } from './Visualizer';
import KeyboardController from "./KeyboardController";
import Organ from "./Organ";

window.addEventListener('load', () => {
    const context: AudioContext = new (AudioContext)();
    const organ = new Organ(context);
    organ.activateRanks(0, 1, 2, 3, 4, 5);
    const reverb = context.createConvolver();

    // Limit the volume
    const dynamics = context.createDynamicsCompressor();
    dynamics.threshold.value = -20;
    dynamics.ratio.value = 10;

    const visualizer = new Visualizer(context);
    document.body.appendChild(visualizer.element);

    const wet = context.createGain();
    wet.gain.value = 1.0;
    const dry = context.createGain();
    dry.gain.value = 0.0;

    organ.output.connect(reverb);
    organ.output.connect(dry);
    reverb.connect(wet);
    wet.connect(dynamics);
    dry.connect(dynamics);
    dynamics.connect(visualizer.input);
    dynamics.connect(context.destination);

    loadSound(context, 'stalbans_a_ortf.wav')
        .then(audioBuffer => {
            reverb.buffer = audioBuffer;
        }).catch((error) => console.error(error));

    new KeyboardController(organ);

    // for debugging
    window['organ'] = organ;
    window['context'] = context;

    document.addEventListener('keydown', (event) => {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.code == 'KeyZ') {
                wet.gain.setTargetAtTime(0, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(1.0, context.currentTime, 0.01);
            } else if (event.code == 'KeyX') {
                wet.gain.setTargetAtTime(0.5, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(0.5, context.currentTime, 0.01);
            } else if (event.code == 'KeyC') {
                wet.gain.setTargetAtTime(1.0, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(0.0, context.currentTime, 0.01);
            }
        }
    });
});
