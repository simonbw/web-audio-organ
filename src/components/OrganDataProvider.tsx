import React, { ReactNode, ReactChild } from "react";
import Organ from "../audio/Organ";
import { keyToPitch, keyToRank } from "../keyboard";

interface Props {
    organ: Organ;
    children: (data:OrganData) => ReactNode;
}

export interface OrganData {
    ranks: ReadonlyArray<boolean>;
    toggleRank: (rank:number) => void;
    play: (pitch:number) => void;
    stop: (pitch:number) => void;
}

export default class OrganDataProvider extends React.Component<Props> {
    private play = (pitch: number) => {
        this.props.organ.play(pitch);
        this.forceUpdate();
    }

    private stop = (pitch: number) => {
        this.props.organ.stop(pitch);
        this.forceUpdate();
    }

    private toggleRank = (rank: number):void => {
        if (rank >= 0 && rank < this.props.organ.ranks.length) {
            this.props.organ.toggleRank(rank);
            this.forceUpdate();
        }
    }

    private makeData():OrganData {
        return {
            ranks: this.props.organ.rankToggles,
            toggleRank: this.toggleRank,
            play: this.play,
            stop: this.stop
        }
    }

    render() {
        return this.props.children(this.makeData()) as any; // TODO: Figure out why this needs this
    };
}
