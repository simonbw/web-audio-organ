import React from "react";
import Knob from 'react-canvas-knob';

interface propTypes {
    gain: GainNode
}

interface stateTypes {
    value: number
}

export default class GainController extends React.Component<propTypes, stateTypes> {
    constructor(props, context) {
        super(props, context);
        this.state = {value: Math.floor(props.gain.gain.value * 100)};
    }

    setReverbAmount(value: number): void {
        const gain = this.props.gain;
        gain.gain.setTargetAtTime(value / 100, gain.context.currentTime, 0.01);
        this.setState({value});
    }

    public render() {
        return (
            <div>
                <label>
                    Volume
                    <Knob
                        value={this.state.value}
                        onChange={(value) => this.setReverbAmount(value)}
                        onChangeEnd={(value) => this.setReverbAmount(value)}
                        min={0.0}
                        max={200}
                        step={1}
                        disableTextInput
                        angleArc={90 * 3}
                        angleOffset={90 * 2.5}
                        title="Gain"
                        width={80}
                        height={80}
                        thickness={0.5}
                        stopper={false}
                        lineCap="butt"
                        inputColor="#FFF"
                    />
                </label>
            </div>
        );
    }
}
