/**
 * Converts a pitch in semitones from A4 to a frequency.
 * @param pitch
 * @return {number}
 */
export function pitchToFrequency(pitch: number): number {
    return 440 * Math.pow(2, pitch / 12.0);
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}