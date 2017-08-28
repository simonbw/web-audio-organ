import Organ from "./audio/Organ";
import Reverb from "./audio/Reverb";

export function bindKeysToOrgan(organ: Organ): void {
    document.addEventListener('keydown', (event) => {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            const pitch = keyToPitch(event.code);
            if (pitch !== null) {
                organ.play(pitch);
            }
            const rank = keyToRank(event.code);
            if (rank !== null) {
                organ.toggleRank(rank);
            }
        }
    });
    document.addEventListener('keyup', (event) => {
        const pitch = keyToPitch(event.code);
        if (pitch !== null) {
            organ.stop(pitch);
        }
    });
}

export function bindKeysToReverb(reverb: Reverb) {
    document.addEventListener('keydown', (event) => {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.code == 'KeyZ') {
                reverb.setWet(1.0);
            } else if (event.code == 'KeyX') {
                reverb.setWet(0.5);
            } else if (event.code == 'KeyC') {
                reverb.setWet(0.0);
            }
        }
    });
}

function keyToPitch(code): number {
    const keyPosition = [
        'KeyQ', // G#
        'KeyA', // A
        'KeyW', // A#
        'KeyS', // B
        // 'KeyE',
        'KeyD', // C
        'KeyR', // C#
        'KeyF', // D
        'KeyT', // D#
        'KeyG', // E
        // 'KeyY',
        'KeyH', // F
        'KeyU', // F#
        'KeyJ', // G
        'KeyI', // G#
        'KeyK', // A
        'KeyO', // A#
        'KeyL', // B
        // 'KeyP',
        'Semicolon', // C
        'BracketLeft', // C#
        'Quote', // D
        'BracketRight', // D#
        'Enter', // E
    ].indexOf(code);
    if (keyPosition >= 0) {
        return keyPosition - 1;
    }
    return null;
}

function keyToRank(code): number {
    const keyPosition = [
        'Digit1',
        'Digit2',
        'Digit3',
        'Digit4',
        'Digit5',
        'Digit6',
        'Digit7',
        'Digit8',
        'Digit9'

    ].indexOf(code);
    if (keyPosition >= 0) {
        return keyPosition;
    }
    return null;
}