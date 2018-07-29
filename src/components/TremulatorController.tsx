import React from 'react';
import Tremulator from "../audio/Tremulator";
import ControlKnob from "./ControlKnob";

interface propTypes {
    tremulator: Tremulator
}

interface stateTypes {
    frequency: number,
    amplitude: number
}

export default class TremulatorController extends React.Component<propTypes, stateTypes> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            frequency: props.tremulator.getFrequency(),
            amplitude: Math.floor(props.tremulator.getAmplitude() * 100)
        };
    }

    setFrequency(frequency: number): void {
        this.props.tremulator.setFrequency(frequency);
        this.setState({frequency});
    }

    setAmplitude(amplitude: number): void {
        this.props.tremulator.setAmplitude(amplitude / 100);
        this.setState({amplitude});
    }

    public render() {
        return (
            <div>
                <ControlKnob
                    max={10}
                    min={0.5}
                    onChange={(value) => this.setFrequency(value)}
                    step={0.1}
                    title="Frequency"
                    value={this.state.frequency}
                />
                <ControlKnob
                    max={100}
                    min={0.0}
                    onChange={(value) => this.setAmplitude(value)}
                    step={1}
                    title="Amplitude"
                    value={this.state.amplitude}
                />
            </div>
        );
    }
};
