import React from "react";
import ControlKnob from "./ControlKnob";
import styles from "../../styles/Layout.css";

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

  setGainAmount(value: number): void {
    const gain = this.props.gain;
    gain.gain.setTargetAtTime(
      2 ** (value / 100) - 1.0,
      gain.context.currentTime,
      0.01
    );
    this.setState({ value });
  }

  public render() {
    return (
      <div className={styles.Box}>
        <ControlKnob
          max={120}
          min={0.0}
          onChange={value => this.setGainAmount(value)}
          step={1}
          title="Volume"
          value={this.state.value}
        />
      </div>
    );
  }
}
