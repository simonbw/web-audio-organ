import React from 'react';
import classnames from 'classnames';
import styles from '../../styles/OrganController.css'

interface Props {
    ranks: ReadonlyArray<boolean>
    toggleRank: (rank:number) => void;
}

export function Ranks({ ranks, toggleRank }) {
    return <div>
        {ranks.map((active, i) => (
            <span
                className={classnames([styles.RankToggle, {[styles.active]: active}])}
                onClick={() => this.props.toggleRank(i)}
                key={i}
            >
                {active ? 'on' : 'off'}
            </span>
        ))}
    </div>
}