import { Visualizer } from './Visualizer';
import KeyboardController from "./KeyboardController";
import Organ from "./Organ";

window.addEventListener('load', () => {
    const context: AudioContext = new AudioContext();

    const organ = new Organ(context);

    // Limit the volume
    const dynamics = context.createGain();
    // dynamics.threshold.value = -20;
    // dynamics.ratio.value = 10;

    const visualizer = new Visualizer(context);
    document.body.appendChild(visualizer.element);

    organ.output.connect(dynamics);
    dynamics.connect(visualizer.input);
    dynamics.connect(context.destination);

    new KeyboardController(organ);

    // for debugging
    window['organ'] = organ;
    window['context'] = context;
});
