// TODO: Don't have so many oscillators all the time. And figure out other ways to reduce computation.

import Rank from "./Rank";
import Tremulator from "./Tremulator";

/**
 * An organ is a collection of ranks.
 */
export default class Organ {
  public output: AudioNode;
  public ranks: Array<Rank>;
  public rankToggles: Array<boolean>;

  private tremulator: Tremulator;

  constructor(context: AudioContext) {
    const gain = (this.output = context.createGain());
    gain.gain.value = 0.1;

    this.tremulator = new Tremulator(context);

    this.rankToggles = [];
    this.ranks = [];

    this.addRank(new Rank(context, this.tremulator.output, -36, 2.0), true);
    this.addRank(new Rank(context, this.tremulator.output, -24, 1.0), true);
    this.addRank(new Rank(context, this.tremulator.output, -12, 1.0), true);
    this.addRank(new Rank(context, this.tremulator.output, 0, 1.0), true);
    this.addRank(new Rank(context, this.tremulator.output, 12, 0.7), true);
    this.addRank(new Rank(context, this.tremulator.output, 24, 0.5), true);
  }

  public getTremulator(): Tremulator {
    return this.tremulator;
  }

  public isRankActive(rankIndex: number): boolean {
    this.checkValidRank(rankIndex);
    return this.rankToggles[rankIndex];
  }

  public toggleRank(rankIndex: number): void {
    if (!this.isRankActive(rankIndex)) {
      this.activateRank(rankIndex);
    } else {
      this.deactivateRank(rankIndex);
    }
  }

  public activateRank(rankIndex: number): void {
    this.checkValidRank(rankIndex);
    this.rankToggles[rankIndex] = true;
  }

  public deactivateRank(rankIndex: number): void {
    this.checkValidRank(rankIndex);
    if (this.rankToggles[rankIndex]) {
      this.ranks[rankIndex].stopAll();
      this.rankToggles[rankIndex] = false;
    }
  }

  private checkValidRank(rankIndex: number) {
    if (rankIndex < 0 || rankIndex >= this.rankToggles.length) {
      throw new Error(`Invalid Rank: ${rankIndex}`);
    }
  }

  public play(pitch: number): void {
    this.getActiveRanks().forEach(rank => {
      rank.play(pitch);
    });
  }

  public stop(pitch: number): void {
    this.getActiveRanks().forEach(rank => {
      rank.stop(pitch);
    });
  }

  private getActiveRanks(): Array<Rank> {
    return this.ranks.filter((rank, i) => this.rankToggles[i]);
  }

  private addRank(rank: Rank, active: boolean = false): void {
    this.ranks.push(rank);
    this.rankToggles.push(active);
    rank.output.connect(this.output);
  }
}
