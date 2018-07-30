import React from "react";
import Reverb from "../audio/Reverb";
import ControlKnob from "./ControlKnob";
import styles from "../../styles/Layout.css";

interface propTypes {
  reverb: Reverb;
}

interface stateTypes {
  value: number;
}

export default class ReverbController extends React.Component<
  propTypes,
  stateTypes
> {
  constructor(props, context) {
    super(props, context);
    this.state = { value: 0.0 };
  }

  public componentDidMount() {
    this.props.reverb.onLoad(() => this.setReverbAmount(100));
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        if (event.code == "KeyZ") {
          this.setReverbAmount(100);
        } else if (event.code == "KeyX") {
          this.setReverbAmount(50);
        } else if (event.code == "KeyC") {
          this.setReverbAmount(0);
        }
      }
    });
  }

  setReverbAmount(value: number): void {
    this.props.reverb.setWet(value / 100);
    this.setState({ value });
  }

  public render() {
    return (
      <div className={styles.Box}>
        <ControlKnob
          disabled={!this.props.reverb.isLoaded()}
          max={100}
          min={0.0}
          onChange={value => this.setReverbAmount(value)}
          step={1}
          title="Reverb"
          value={this.state.value}
        />
      </div>
    );
  }
}
