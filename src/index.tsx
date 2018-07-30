import React from "react";
import ReactDOM from "react-dom";
import Organ from "./audio/Organ";
import Reverb from "./audio/Reverb";
import Main from "./components/Main";
import { polyfill as polyfillStereoPannerNode } from "stereo-panner-node";

declare global {
  interface Window {
    AudioContext: { new (): AudioContext };
    webkitAudioContext: { new (): AudioContext };
  }
}

window.addEventListener("load", () => {
  polyfillStereoPannerNode();
  const context: AudioContext = new (window.AudioContext ||
    window.webkitAudioContext)();
  const masterGain = context.createGain();
  const mute = context.createGain();
  const organ = new Organ(context);
  const reverb = new Reverb(context);

  // Limit the volume
  const dynamics = context.createDynamicsCompressor();
  dynamics.threshold.value = -20;
  dynamics.ratio.value = 10;

  organ.output.connect(reverb.input);
  reverb.output.connect(dynamics);
  dynamics.connect(masterGain);
  masterGain.connect(mute);
  mute.connect(context.destination);

  document.addEventListener("visibilitychange", () => {
    mute.gain.cancelScheduledValues(0);
    mute.gain.setValueAtTime(mute.gain.value, context.currentTime);
    if (document.hidden) {
      mute.gain.linearRampToValueAtTime(0, context.currentTime + 0.05);
    } else {
      mute.gain.linearRampToValueAtTime(1, context.currentTime + 0.05);
    }
  });

  // for debugging
  window["organ"] = organ;
  window["context"] = context;

  ReactDOM.render(
    // React.createElement(Main, {organ, reverb, masterGain}),
    <Main organ={organ} reverb={reverb} masterGain={masterGain} />,
    document.getElementById("react-container")
  );
});
