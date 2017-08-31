/**
 * Converts a pitch give in semitones above A4 to a frequency in Hz.
 * @param pitch
 * @return {number}
 */
export function pitchToFrequency(pitch: number): number {
    return 440 * Math.pow(2, pitch / 12.0);
}

/**
 * Generate a random integer in the range [min, max)
 * @param min
 * @param max
 * @return {number}
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Clamp value to the range [min, max]
 * @param value
 * @param min
 * @param max
 * @return {number}
 */
export function clamp(value: number, min: number = -1.0, max: number = 1.0): number {
    return Math.max(Math.min(value, max), min);
}

/**
 * Save already loaded sounds.
 * @type {{[string]: Promise<AudioBuffer>}}
 */
const sounds = {};

/**
 * Loads a sound from a filename. Uses cached version if already loaded.
 * @param context
 * @param filename
 * @return {Promise<Response>}
 */
export function getSound(context: AudioContext, filename: string): Promise<AudioBuffer> {
    if (sounds[filename] == null) {
        sounds[filename] = fetch(`sounds/${filename}`)
            .then((response: Response) => response.arrayBuffer())
            .then((arrayBuffer: ArrayBuffer) => context.decodeAudioData(arrayBuffer));
    }
    return sounds[filename];
}