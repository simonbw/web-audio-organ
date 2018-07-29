import React from "react";
import Knob from "react-canvas-knob";
import ControlKnob from "./ControlKnob";

interface propTypes {
  gain: GainNode;
}

interface stateTypes {
  value: number;
}

export default class GainController extends React.Component<
  propTypes,
  stateTypes
> {
  constructor(props, context) {
    super(props, context);
    this.state = { value: Math.floor(props.gain.gain.value * 100) };
  }

  setReverbAmount(value: number): void {
    const gain = this.props.gain;
    gain.gain.setTargetAtTime(value / 100, gain.context.currentTime, 0.01);
    this.setState({ value });
  }

  public render() {
    return (
      <div>
        <ControlKnob
          value={this.state.value}
          onChange={value => this.setReverbAmount(value)}
          min={0.0}
          max={200}
          step={1}
          title="Volume"
        />
      </div>
    );
  }
}
