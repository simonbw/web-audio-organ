import React from "react";
import "../../styles/main.css";
import Organ from "../audio/Organ";
import Reverb from "../audio/Reverb";
import GainController from "./GainController";
import OrganDataProvider, { OrganData } from "./OrganDataProvider";
import ReverbController from "./ReverbController";
import TremulatorController from "./TremulatorController";
import { Ranks } from "./Ranks";
import NotesController from "./NotesController";
import styles from "../../styles/Layout.css";
import { Footer } from "./Footer";

interface propTypes {
  organ: Organ;
  reverb: Reverb;
  masterGain: GainNode;
}

export default function Main({ organ, reverb, masterGain }: propTypes) {
  return (
    <div className={styles.MainContainer}>
      <OrganDataProvider organ={organ}>
        {({ ranks, play, stop, toggleRank, notes }: OrganData) => (
          <div className={styles.ControlsContainer}>
            <Ranks ranks={ranks} toggleRank={toggleRank} />
            <ReverbController reverb={reverb} />
            <GainController gain={masterGain} />
            <TremulatorController tremulator={organ.getTremulator()} />
            <NotesController play={play} stop={stop} notes={notes} />
          </div>
        )}
      </OrganDataProvider>
      <Footer />
    </div>
  );
}
