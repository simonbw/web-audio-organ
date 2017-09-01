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
        this.props.reverb.onLoad(() => this.setReverbAmount(50));
    }

    setReverbAmount(value: number): void {
        this.props.reverb.setWet(value / 100);
        this.setState({value});
    }

    public render() {
        const loading = !this.props.reverb.isLoaded();
        return (
            <div>
                <label>
                    Reverb
                    <Knob
                        angleArc={90 * 3}
                        angleOffset={90 * 2.5}
                        bgColor={loading ? "#666" : "#FFF"}
                        disableTextInput
                        height={80}
                        inputColor={loading ? "#666" : "#FFF"}
                        lineCap="butt"
                        max={100}
                        min={0.0}
                        onChange={(value) => this.setReverbAmount(value)}
                        onChangeEnd={(value) => this.setReverbAmount(value)}
                        readOnly={loading}
                        step={1}
                        stopper={false}
                        thickness={0.5}
                        title="Reverb"
                        value={this.state.value}
                        width={80}
                    />
                </label>
            </div>
        );
    }
}
