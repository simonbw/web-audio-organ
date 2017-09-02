import classnames from 'classnames';
import React from "react";
import styles from '../../styles/OrganController.css';
import Organ from "../audio/Organ";
import { keyToPitch, keyToRank } from "../keyboard";

interface propTypes {
    organ: Organ
}

export default class OrganController extends React.Component<propTypes> {

    public componentDidMount() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                const pitch = keyToPitch(event.code);
                if (pitch !== null) {
                    this.play(pitch);
                }
                const rank = keyToRank(event.code);
                if (rank !== null) {
                    this.toggleRank(rank);
                }
            }
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            const pitch = keyToPitch(event.code);
            if (pitch !== null) {
                this.stop(pitch);
            }
        });
    }

    private play(pitch: number) {
        this.props.organ.play(pitch);
        this.forceUpdate();
    }

    private stop(pitch: number) {
        this.props.organ.stop(pitch);
        this.forceUpdate();
    }

    private toggleRank(rank: number) {
        if (rank >= 0 && rank < this.props.organ.ranks.length) {
            this.props.organ.toggleRank(rank);
            this.forceUpdate();
        }
    }

    public render() {
        const organ = this.props.organ;
        return (
            <div className={styles.OrganController}>
                {organ.rankToggles.map((active, i) => (
                    <span
                        className={classnames([styles.RankToggle, {[styles.active]: active}])}
                        onClick={() => this.toggleRank(i)}
                        key={i}
                    >
                        {active ? 'on' : 'off'}
                    </span>
                ))}
            </div>
        );
    };
}
