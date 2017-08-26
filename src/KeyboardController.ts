import Organ from "./Organ";

export default class KeyboardController {
    constructor(organ: Organ) {
        document.addEventListener('keydown', (event) => {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                const pitch = this.keyToPitch(event.code);
                if (pitch !== null) {
                    organ.play(pitch);
                }
                const rank = this.keyToRank(event.code);
                if (rank !== null) {
                    organ.toggleRank(rank);
                }
            }
        });
        document.addEventListener('keyup', (event) => {
            const pitch = this.keyToPitch(event.code);
            if (pitch !== null) {
                organ.stop(pitch);
            }
        });
    }

    private keyToPitch(code): number {
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

    private keyToRank(code): number {
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
}