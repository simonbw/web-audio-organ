import React from "react";
import "../../styles/main.css";
import Organ from "../audio/Organ";
import Reverb from "../audio/Reverb";
import Credits from "./Credits";
import GainController from "./GainController";
import Instructions from "./Instructions";
import OrganDataProvider, { OrganData } from "./OrganDataProvider";
import ReverbController from "./ReverbController";
import TremulatorController from "./TremulatorController";
import { Ranks } from "./Ranks";
import OrganKeyboardController from "./OrganKeyboardController";

interface propTypes {
  organ: Organ;
  reverb: Reverb;
  masterGain: GainNode;
}

export default function Main({ organ, reverb, masterGain }: propTypes) {
  return (
    <div>
      <Instructions />
      <Credits />
      <OrganDataProvider organ={organ}>
        {({ ranks, play, stop, toggleRank }: OrganData) => (
          <div>
            <OrganKeyboardController
              play={play}
              stop={stop}
              toggleRank={toggleRank}
            />
            <Ranks ranks={ranks} toggleRank={toggleRank} />
            <ReverbController reverb={reverb} />
            <GainController gain={masterGain} />
            <TremulatorController tremulator={organ.getTremulator()} />
          </div>
        )}
      </OrganDataProvider>
    </div>
  );
}
