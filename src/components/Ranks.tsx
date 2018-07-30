import React from "react";
import classnames from "classnames";
import styles from "../../styles/Ranks.css";
import { keyToRank } from "../keyboard";

interface Props {
  ranks: ReadonlyArray<boolean>;
  toggleRank: (rank: number) => void;
}

export class Ranks extends React.Component<Props> {
  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const rank = keyToRank(event.code);
      if (rank !== null) {
        this.props.toggleRank(rank);
      }
    }
  };

  render() {
    const { ranks, toggleRank } = this.props;
    return (
      <div className={styles.RanksContainer}>
        <h2>Ranks</h2>
        <div className={styles.Ranks}>
          {ranks.map((on, i) => (
            <div
              className={classnames([styles.RankToggle, { [styles.on]: on }])}
              onClick={() => toggleRank(i)}
              key={i}
            >
              <span className={styles.RankNumber}>{i + 1}</span>
              <span className={styles.RankStatus}>{on ? "on" : "off"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
