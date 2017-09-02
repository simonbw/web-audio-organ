import React from "react";
import '../../styles/main.css';
import Organ from "../audio/Organ";
import Reverb from "../audio/Reverb";
import Credits from "./Credits";
import GainController from "./GainController";
import Instructions from "./Instructions";
import OrganController from "./OrganController";
import ReverbController from "./ReverbController";
import TremulatorController from "./TremulatorController";

interface propTypes {
    organ: Organ,
    reverb: Reverb
    masterGain: GainNode
}

export default function Main({organ, reverb, masterGain}: propTypes) {
    return (
        <div>
            <Instructions/>
            <Credits/>
            <OrganController organ={organ}/>
            <ReverbController reverb={reverb}/>
            <GainController gain={masterGain}/>
            <TremulatorController tremulator={organ.getTremulator()}/>
        </div>
    );
}