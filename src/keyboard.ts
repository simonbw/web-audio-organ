export function keyToPitch(code): number {
  const keyPosition = [
    "KeyQ", // G#
    "KeyA", // A
    "KeyW", // A#
    "KeyS", // B
    // 'KeyE',
    "KeyD", // C
    "KeyR", // C#
    "KeyF", // D
    "KeyT", // D#
    "KeyG", // E
    // 'KeyY',
    "KeyH", // F
    "KeyU", // F#
    "KeyJ", // G
    "KeyI", // G#
    "KeyK", // A
    "KeyO", // A#
    "KeyL", // B
    // 'KeyP',
    "Semicolon", // C
    "BracketLeft", // C#
    "Quote", // D
    "BracketRight", // D#
    "Enter", // E
    "Backslash" // F
  ].indexOf(code);
  if (keyPosition >= 0) {
    return keyPosition - 1;
  }
  return null;
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
