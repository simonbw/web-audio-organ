import React from "react";
import ReactDOM from "react-dom";
import Organ from "./audio/Organ";
import Reverb from "./audio/Reverb";
import Main from "./components/Main";

declare const webkitAudioContext: { new(): AudioContext };

window.addEventListener('load', () => {
    const context: AudioContext = new (AudioContext || webkitAudioContext)();
    const masterGain = context.createGain();
    const organ = new Organ(context);
    const reverb = new Reverb(context);

    // Limit the volume
    const dynamics = context.createDynamicsCompressor();
    dynamics.threshold.value = -20;
    dynamics.ratio.value = 10;

    organ.output.connect(reverb.input);
    reverb.output.connect(dynamics);
    dynamics.connect(masterGain);
    masterGain.connect(context.destination);

    // for debugging
    window['organ'] = organ;
    window['context'] = context;

    ReactDOM.render(
        // React.createElement(Main, {organ, reverb, masterGain}),
        <Main organ={organ} reverb={reverb} masterGain={masterGain}/>,
        document.getElementById('react-container')
    );
});
