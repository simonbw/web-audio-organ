import React from "react";
import Reverb from "../audio/Reverb";
import Knob from 'react-canvas-knob';

interface propTypes {
    reverb: Reverb
}

interface stateTypes {
    value: number
}

export default class ReverbController extends React.Component<propTypes, stateTypes> {
    constructor(props, context) {
        super(props, context);
        this.state = {value: 0.0};
    }

    public componentDidMount() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                if (event.code == 'KeyZ') {
                    this.setReverbAmount(100);
                } else if (event.code == 'KeyX') {
                    this.setReverbAmount(50);
                } else if (event.code == 'KeyC') {
                    this.setReverbAmount(0);
                }
            }
        });
    }

    setReverbAmount(value: number): void {
        this.props.reverb.setWet(value / 100);
        this.setState({value});
    }

    public render() {
        return (
            <div>
                <label>
                    Reverb
                    <Knob
                        value={this.state.value}
                        onChange={(value) => this.setReverbAmount(value)}
                        onChangeEnd={(value) => this.setReverbAmount(value)}
                        min={0.0}
                        max={100}
                        step={1}
                        disableTextInput
                        angleArc={90 * 3}
                        angleOffset={90 * 2.5}
                        title="Reverb"
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
