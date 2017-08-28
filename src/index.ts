import Reverb from './audio/Reverb';
import { bindKeysToOrgan, bindKeysToReverb } from "./KeyboardController";
import Organ from "./audio/Organ";

window.addEventListener('load', () => {
    const context: AudioContext = new AudioContext();
    const organ = new Organ(context);
    organ.activateRanks(0, 1, 2, 3, 4, 5);

    const reverb = new Reverb(context, 0.5);

    // Limit the volume
    const dynamics = context.createDynamicsCompressor();
    dynamics.threshold.value = -20;
    dynamics.ratio.value = 10;

    organ.output.connect(reverb.input);
    reverb.output.connect(dynamics);
    dynamics.connect(context.destination);

    bindKeysToOrgan(organ);
    bindKeysToReverb(reverb);

    // for debugging
    window['organ'] = organ;
    window['context'] = context;

});
