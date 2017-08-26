export class Visualizer {
    public input: AudioNode;
    public element: Element;
    private analyser: AnalyserNode;
    private analyserData: Uint8Array;
    private bars: Array<HTMLElement>;

    constructor(audioContext: AudioContext) {
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
        this.input = this.analyser;

        this.element = document.createElement("div");
        this.element.classList.add('Visualizer');

        this.bars = [];
        for (let i = 0; i < 24; i++) {
            const bar = document.createElement('div');
            bar.classList.add('Visualizer-bar');
            this.element.appendChild(bar);
            this.bars.push(bar);
        }

        this.draw();
    }

    public draw() {
        requestAnimationFrame(() => this.draw());

        this.analyser.getByteFrequencyData(this.analyserData);

        this.bars.forEach((bar, i) => {
            const value = this.getBarValue(i);
            bar.style.height = `${value * 100}%`;
            if (value > 0.95) {
                bar.style.backgroundColor = `#F00`;
            } else if (value > 0.8) {
                bar.style.backgroundColor = `#FF0`;
            } else {
                bar.style.backgroundColor = `#FFF`;
            }
        });

    }

    private getBarValue(i: number): number {
        const dataPerBar = this.analyserData.length / this.bars.length;
        let value = 0;
        const start = Math.floor((i * dataPerBar));
        const end = start + Math.floor(dataPerBar);
        for (let j = start; j < end; j++) {
            value = Math.max(this.analyserData[j] / 256, value)
        }
        return value;
    }
}

// const canvas = <HTMLCanvasElement> this.element;
// const canvasContext = canvas.getContext("2d");
//
// canvasContext.fillStyle = 'rgb(200, 200, 200)';
// canvasContext.fillRect(0, 0, canvas.width, canvas.height);
//
// canvasContext.lineWidth = 2;
// canvasContext.strokeStyle = 'rgb(0, 0, 0)';
//
// canvasContext.beginPath();
// const sliceWidth = canvas.width / this.analyser.frequencyBinCount;
//
// for (let i = 0, x = 0; i < this.analyser.frequencyBinCount; i++) {
//
//     const v = this.analyserData[i] / 128.0;
//     const y = v * canvas.height / 2;
//
//     if (i === 0) {
//         canvasContext.moveTo(x, y);
//     } else {
//         canvasContext.lineTo(x, y);
//     }
//
//     x += sliceWidth;
// }
//
// canvasContext.lineTo(canvas.width, canvas.height / 2);
// canvasContext.stroke();
