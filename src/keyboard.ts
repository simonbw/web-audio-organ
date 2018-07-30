const keys = [
  "KeyQ",
  "KeyA",
  "KeyW",
  "KeyS",
  // 'KeyE',
  "KeyD",
  "KeyR",
  "KeyF",
  "KeyT",
  "KeyG",
  "KeyY",
  "KeyH",
  // "KeyU",
  "KeyJ",
  "KeyI",
  "KeyK",
  "KeyO",
  "KeyL",
  // 'KeyP',
  "Semicolon",
  "BracketLeft",
  "Quote",
  "BracketRight",
  "Enter",
  "Backslash"
];

export const MIN_NOTE = 4;
export const MAX_NOTE = MIN_NOTE + keys.length;

export function keyToNote(code: string): number {
  const keyPosition = keys.indexOf(code);
  if (keyPosition >= 0) {
    return keyPosition + MIN_NOTE;
  }
  return null;
}

export function noteToKey(note: number): string {
  return keys[note - MIN_NOTE];
}

export function keyToRank(code): number {
  const keyPosition = [
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9"
  ].indexOf(code);
  if (keyPosition >= 0) {
    return keyPosition;
  }
  return null;
}
