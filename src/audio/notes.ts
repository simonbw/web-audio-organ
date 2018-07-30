import { mod } from "./util";

const names = ["A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"];

export function noteToName(note: number): string {
  return names[mod(note, names.length)];
}

export function isWhiteNote(note: number): boolean {
  return noteToName(note).indexOf("♭") < 0;
}
