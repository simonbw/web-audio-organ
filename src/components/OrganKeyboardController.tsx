import React, { ReactNode, ReactChild } from "react";
import { keyToPitch, keyToRank } from "../keyboard";

interface Props {
    play: (pitch:number) => void;
    stop: (pitch:number) => void;
    toggleRank: (rank:number) => void;
}


export default class OrganKeyboardController extends React.Component<Props> {
    componentDidMount() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                const pitch = keyToPitch(event.code);
                if (pitch !== null) {
                    this.props.play(pitch);
                }
                const rank = keyToRank(event.code);
                if (rank !== null) {
                    this.props.toggleRank(rank);
                }
            }
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            const pitch = keyToPitch(event.code);
            if (pitch !== null) {
                this.props.stop(pitch);
            }
        });
    }

    render() {
        return null;
    };
}
