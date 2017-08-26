/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var Visualizer_1 = __webpack_require__(1);
var KeyboardController_1 = __webpack_require__(2);
var Organ_1 = __webpack_require__(3);
window.addEventListener('load', function () {
    var context = new AudioContext();
    var organ = new Organ_1["default"](context);
    // Limit the volume
    var dynamics = context.createGain();
    // dynamics.threshold.value = -20;
    // dynamics.ratio.value = 10;
    var visualizer = new Visualizer_1.Visualizer(context);
    document.body.appendChild(visualizer.element);
    organ.output.connect(dynamics);
    dynamics.connect(visualizer.input);
    dynamics.connect(context.destination);
    new KeyboardController_1["default"](organ);
    // for debugging
    window['organ'] = organ;
    window['context'] = context;
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var Visualizer = (function () {
    function Visualizer(audioContext) {
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
        this.input = this.analyser;
        this.element = document.createElement("div");
        this.element.classList.add('Visualizer');
        this.bars = [];
        for (var i = 0; i < 24; i++) {
            var bar = document.createElement('div');
            bar.classList.add('Visualizer-bar');
            this.element.appendChild(bar);
            this.bars.push(bar);
        }
        this.draw();
    }
    Visualizer.prototype.draw = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.draw(); });
        this.analyser.getByteFrequencyData(this.analyserData);
        this.bars.forEach(function (bar, i) {
            var value = _this.getBarValue(i);
            bar.style.height = value * 100 + "%";
            if (value > 0.95) {
                bar.style.backgroundColor = "#F00";
            }
            else if (value > 0.8) {
                bar.style.backgroundColor = "#FF0";
            }
            else {
                bar.style.backgroundColor = "#FFF";
            }
        });
    };
    Visualizer.prototype.getBarValue = function (i) {
        var dataPerBar = this.analyserData.length / this.bars.length;
        var value = 0;
        var start = Math.floor((i * dataPerBar));
        var end = start + Math.floor(dataPerBar);
        for (var j = start; j < end; j++) {
            value = Math.max(this.analyserData[j] / 256, value);
        }
        return value;
    };
    return Visualizer;
}());
exports.Visualizer = Visualizer;
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var KeyboardController = (function () {
    function KeyboardController(organ) {
        var _this = this;
        document.addEventListener('keydown', function (event) {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                var pitch = _this.keyToPitch(event.code);
                if (pitch !== null) {
                    organ.play(pitch);
                }
                var rank = _this.keyToRank(event.code);
                if (rank !== null) {
                    organ.toggleRank(rank);
                }
            }
        });
        document.addEventListener('keyup', function (event) {
            var pitch = _this.keyToPitch(event.code);
            if (pitch !== null) {
                organ.stop(pitch);
            }
        });
    }
    KeyboardController.prototype.keyToPitch = function (code) {
        var keyPosition = [
            'KeyQ',
            'KeyA',
            'KeyW',
            'KeyS',
            // 'KeyE',
            'KeyD',
            'KeyR',
            'KeyF',
            'KeyT',
            'KeyG',
            // 'KeyY',
            'KeyH',
            'KeyU',
            'KeyJ',
            'KeyI',
            'KeyK',
            'KeyO',
            'KeyL',
            // 'KeyP',
            'Semicolon',
            'BracketLeft',
            'Quote',
            'BracketRight',
            'Enter',
        ].indexOf(code);
        if (keyPosition >= 0) {
            return keyPosition - 1;
        }
        return null;
    };
    KeyboardController.prototype.keyToRank = function (code) {
        var keyPosition = [
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
    };
    return KeyboardController;
}());
exports["default"] = KeyboardController;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var util_1 = __webpack_require__(4);
// TODO: Don't have so many oscillators all the time. And figure out other ways to reduce computation.
/**
 * An organ is a collection of ranks.
 */
var Organ = (function () {
    function Organ(context) {
        var _this = this;
        this.output = context.createGain();
        var tremulatorOscillator = context.createOscillator();
        tremulatorOscillator.frequency.value = 3.0;
        tremulatorOscillator.start();
        var tremulatorStrength = context.createGain();
        tremulatorOscillator.connect(tremulatorStrength);
        tremulatorStrength.gain.value = 0.2;
        this.activeRanks = [];
        this.ranks = [];
        this.ranks.push(new Rank(context, tremulatorStrength, -36));
        this.ranks.push(new Rank(context, tremulatorStrength, -24));
        this.ranks.push(new Rank(context, tremulatorStrength, -12));
        this.ranks.push(new Rank(context, tremulatorStrength, 0));
        this.ranks.push(new Rank(context, tremulatorStrength, 12));
        this.ranks.push(new Rank(context, tremulatorStrength, 24));
        // this.ranks.push(new Rank(context, tremulatorStrength, 36));
        this.ranks.forEach(function (rank) { return rank.output.connect(_this.output); });
    }
    Organ.prototype.isRankActive = function (rankIndex) {
        this.validateRank(rankIndex);
        return this.activeRanks.indexOf(this.ranks[rankIndex]) >= 0;
    };
    Organ.prototype.toggleRank = function (rankIndex) {
        if (!this.isRankActive(rankIndex)) {
            this.activateRank(rankIndex);
        }
        else {
            this.deactivateRank(rankIndex);
        }
    };
    Organ.prototype.activateRank = function (rankIndex) {
        this.validateRank(rankIndex);
        var rank = this.ranks[rankIndex];
        if (this.activeRanks.indexOf(rank) == -1) {
            this.activeRanks.push(rank);
            console.log("Activate rank " + rankIndex);
        }
    };
    Organ.prototype.deactivateRank = function (rankIndex) {
        this.validateRank(rankIndex);
        var rank = this.ranks[rankIndex];
        var activeRankIndex = this.activeRanks.indexOf(rank);
        if (activeRankIndex != -1) {
            this.activeRanks.splice(activeRankIndex, 1);
            console.log("Deactivate rank " + rankIndex);
            rank.stopAll();
        }
    };
    Organ.prototype.validateRank = function (rankIndex) {
        if (rankIndex < 0 || rankIndex >= this.ranks.length) {
            throw new RangeError("Invalid Rank: " + rankIndex);
        }
    };
    Organ.prototype.play = function (pitch) {
        this.activeRanks.forEach(function (rank) {
            rank.play(pitch);
        });
    };
    Organ.prototype.stop = function (pitch) {
        this.activeRanks.forEach(function (rank) {
            rank.stop(pitch);
        });
    };
    return Organ;
}());
exports["default"] = Organ;
/**
 * A rank is a set of pipes.
 */
var Rank = (function () {
    function Rank(context, tremulator, offset) {
        var gain = context.createGain();
        gain.gain.value = 0.1;
        this.output = gain;
        this.pipes = {};
        for (var i = -1; i < 20; i++) {
            var pipe = new Pipe(context, i + offset, tremulator);
            pipe.output.connect(gain);
            this.pipes[i] = pipe;
        }
    }
    Rank.prototype.play = function (pitch) {
        this.pipes[pitch].play();
    };
    Rank.prototype.stop = function (pitch) {
        this.pipes[pitch].stop();
    };
    Rank.prototype.stopAll = function () {
        for (var pitch in this.pipes) {
            this.pipes[pitch].stop();
        }
    };
    return Rank;
}());
var Pipe = (function () {
    function Pipe(context, pitch, tremulator) {
        this.pitch = pitch;
        this.playing = false;
        this.maxGain = 0.1;
        this.gain = context.createGain(); // Main volume control
        this.gain.gain.value = 0;
        this.output = this.gain;
        this.highpass = context.createBiquadFilter();
        // Creates the sound
        var oscillator = context.createOscillator();
        oscillator.frequency.value = util_1.pitchToFrequency(pitch);
        oscillator.setPeriodicWave(this.getPeriodicWave(context));
        // Tremelo
        var tremelo = context.createGain();
        var tremeloStrength = context.createGain();
        tremeloStrength.gain.value = 1.0;
        tremulator.connect(tremeloStrength);
        tremeloStrength.connect(tremelo.gain);
        // Vibrato
        var vibratoPitchStrength = context.createGain();
        vibratoPitchStrength.gain.value = 10.0;
        tremulator.connect(vibratoPitchStrength);
        // vibratoPitchStrength.connect(oscillator.detune);
        oscillator.connect(tremelo);
        oscillator.start();
        // tremelo.connect(this.highpass);
        // this.highpass.connect(this.gain);
        tremelo.connect(this.gain);
    }
    /**
     * Construct the spectrum for the pipe.
     * @param context
     * @return {PeriodicWave}
     */
    Pipe.prototype.getPeriodicWave = function (context) {
        var NUMBER_OF_HARMONICS = 16;
        var EVEN_COEFFICIENT = 0.3;
        var DECAY = 3.5;
        var real = new Float32Array(NUMBER_OF_HARMONICS);
        var imag = new Float32Array(NUMBER_OF_HARMONICS);
        real[0] = 0;
        imag[0] = 0;
        for (var i = 1; i < NUMBER_OF_HARMONICS; i++) {
            if (i % 2 == 1) {
                real[i] = 1.0 / (Math.pow(i, DECAY));
            }
            else {
                real[i] = EVEN_COEFFICIENT / (Math.pow(i, DECAY));
            }
            imag[i] = 0;
        }
        // TODO: Chiff
        return context.createPeriodicWave(real, imag, { disableNormalization: true });
    };
    /**
     * @return {number} time to warm up
     */
    Pipe.prototype.getAttackLength = function (currentGain) {
        var percent = Math.pow(util_1.clamp((this.pitch + 36) / 72, 0, 1.0), 1.5); // [0.0, 1.0]
        var maxLength = 0.5 / (1.0 + 19 * percent); // [0.025, 0.5]
        return (1.0 - currentGain / this.maxGain) * maxLength;
    };
    /**
     * @return {number} time to cool down
     */
    Pipe.prototype.getDecayLength = function (currentGain) {
        var percent = Math.pow(util_1.clamp((this.pitch + 36) / 72, 0, 1.0), 1.5); // [0.0, 1.0]
        var maxLength = 0.5 / (1.0 + 19 * percent); // [0.025, 0.5]
        return (currentGain / this.maxGain) * maxLength;
    };
    Pipe.prototype.play = function () {
        if (!this.playing) {
            this.playing = true;
            console.log('pipe played');
            var now = this.output.context.currentTime;
            var currentGain = this.gain.gain.value;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(currentGain, now);
            this.gain.gain.linearRampToValueAtTime(this.maxGain, now + this.getAttackLength(currentGain));
        }
    };
    Pipe.prototype.stop = function () {
        if (this.playing) {
            this.playing = false;
            console.log('pipe stopped');
            var now = this.output.context.currentTime;
            var currentGain = this.gain.gain.value;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(currentGain, now);
            this.gain.gain.linearRampToValueAtTime(0, now + this.getDecayLength(currentGain));
        }
    };
    return Pipe;
}());


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * Converts a pitch give in semitones above A4 to a frequency in Hz.
 * @param pitch
 * @return {number}
 */
function pitchToFrequency(pitch) {
    return 440 * Math.pow(2, pitch / 12.0);
}
exports.pitchToFrequency = pitchToFrequency;
/**
 * Generate a random integer in the range [min, max)
 * @param min
 * @param max
 * @return {number}
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
exports.randomInt = randomInt;
/**
 * Clamp value to the range [min, max]
 * @param value
 * @param min
 * @param max
 * @return {number}
 */
function clamp(value, min, max) {
    if (min === void 0) { min = -1.0; }
    if (max === void 0) { max = 1.0; }
    return Math.max(Math.min(value, max), min);
}
exports.clamp = clamp;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTE3MzFhNTM2NjUzNzNhY2MwNzUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9WaXN1YWxpemVyLnRzIiwid2VicGFjazovLy8uL3NyYy9LZXlib2FyZENvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL09yZ2FuLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQSwwQ0FBMEM7QUFDMUMsa0RBQXNEO0FBQ3RELHFDQUE0QjtBQUU1QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0lBQzVCLElBQU0sT0FBTyxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBRWpELElBQU0sS0FBSyxHQUFHLElBQUksa0JBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVqQyxtQkFBbUI7SUFDbkIsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RDLGtDQUFrQztJQUNsQyw2QkFBNkI7SUFFN0IsSUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUU5QyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxJQUFJLCtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTlCLGdCQUFnQjtJQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDaEMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUMxQkg7SUFPSSxvQkFBWSxZQUEwQjtRQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFCLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFTSx5QkFBSSxHQUFYO1FBQUEsaUJBaUJDO1FBaEJHLHFCQUFxQixDQUFDLGNBQU0sWUFBSSxDQUFDLElBQUksRUFBRSxFQUFYLENBQVcsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxLQUFLLEdBQUcsR0FBRyxNQUFHLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQ3ZDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztZQUN2QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTyxnQ0FBVyxHQUFuQixVQUFvQixDQUFTO1FBQ3pCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQy9ELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9CLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQztRQUN2RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQUFDO0FBeERZLGdDQUFVO0FBMER2QixtREFBbUQ7QUFDbkQsaURBQWlEO0FBQ2pELEVBQUU7QUFDRixrREFBa0Q7QUFDbEQsNkRBQTZEO0FBQzdELEVBQUU7QUFDRiwrQkFBK0I7QUFDL0IsOENBQThDO0FBQzlDLEVBQUU7QUFDRiw2QkFBNkI7QUFDN0IscUVBQXFFO0FBQ3JFLEVBQUU7QUFDRixxRUFBcUU7QUFDckUsRUFBRTtBQUNGLDhDQUE4QztBQUM5Qyx1Q0FBdUM7QUFDdkMsRUFBRTtBQUNGLHFCQUFxQjtBQUNyQixzQ0FBc0M7QUFDdEMsZUFBZTtBQUNmLHNDQUFzQztBQUN0QyxRQUFRO0FBQ1IsRUFBRTtBQUNGLHVCQUF1QjtBQUN2QixJQUFJO0FBQ0osRUFBRTtBQUNGLHlEQUF5RDtBQUN6RCwwQkFBMEI7Ozs7Ozs7Ozs7QUNuRjFCO0lBQ0ksNEJBQVksS0FBWTtRQUF4QixpQkFtQkM7UUFsQkcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLEtBQUs7WUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQ0QsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUs7WUFDckMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHVDQUFVLEdBQWxCLFVBQW1CLElBQUk7UUFDbkIsSUFBTSxXQUFXLEdBQUc7WUFDaEIsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLFVBQVU7WUFDVixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLFVBQVU7WUFDVixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sVUFBVTtZQUNWLFdBQVc7WUFDWCxhQUFhO1lBQ2IsT0FBTztZQUNQLGNBQWM7WUFDZCxPQUFPO1NBQ1YsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLHNDQUFTLEdBQWpCLFVBQWtCLElBQUk7UUFDbEIsSUFBTSxXQUFXLEdBQUc7WUFDaEIsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1NBRVgsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN2QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0wseUJBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7OztBQzNFRCxvQ0FBaUQ7QUFFakQsc0dBQXNHO0FBRXRHOztHQUVHO0FBQ0g7SUFLSSxlQUFZLE9BQXFCO1FBQWpDLGlCQW9CQztRQW5CRyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVuQyxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hELG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQzNDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hELG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2pELGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBRXBDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNELDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksSUFBSyxXQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLEVBQWhDLENBQWdDLENBQUM7SUFDbEUsQ0FBQztJQUVNLDRCQUFZLEdBQW5CLFVBQW9CLFNBQWlCO1FBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVNLDBCQUFVLEdBQWpCLFVBQWtCLFNBQWlCO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBRU0sNEJBQVksR0FBbkIsVUFBb0IsU0FBaUI7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFpQixTQUFXLENBQUMsQ0FBQztRQUM5QyxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFjLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxFQUFFLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFtQixTQUFXLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFFTyw0QkFBWSxHQUFwQixVQUFxQixTQUFpQjtRQUNsQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxJQUFJLFVBQVUsQ0FBQyxtQkFBaUIsU0FBVyxDQUFDO1FBQ3RELENBQUM7SUFDTCxDQUFDO0lBRU0sb0JBQUksR0FBWCxVQUFZLEtBQWE7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sb0JBQUksR0FBWCxVQUFZLEtBQWE7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsWUFBQztBQUFELENBQUM7O0FBRUQ7O0dBRUc7QUFDSDtJQUlJLGNBQVksT0FBcUIsRUFBRSxVQUFxQixFQUFFLE1BQWM7UUFDcEUsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFTSxtQkFBSSxHQUFYLFVBQVksS0FBYTtRQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxtQkFBSSxHQUFYLFVBQVksS0FBYTtRQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxzQkFBTyxHQUFkO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO0lBQ0wsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQUFDO0FBRUQ7SUFRSSxjQUFZLE9BQXFCLEVBQUUsS0FBYSxFQUFFLFVBQXFCO1FBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBRW5CLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsc0JBQXNCO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXhCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFN0Msb0JBQW9CO1FBQ3BCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzlDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLHVCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRTFELFVBQVU7UUFDVixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckMsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQyxVQUFVLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLFVBQVU7UUFDVixJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN2QyxVQUFVLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDekMsbURBQW1EO1FBRW5ELFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRW5CLGtDQUFrQztRQUNsQyxvQ0FBb0M7UUFDcEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyw4QkFBZSxHQUF2QixVQUF3QixPQUFxQjtRQUN6QyxJQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUMvQixJQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztRQUM3QixJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7UUFFbEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuRCxJQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1osR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBQyxFQUFJLEtBQUssRUFBQyxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFDLEVBQUksS0FBSyxFQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUNELGNBQWM7UUFFZCxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7T0FFRztJQUNLLDhCQUFlLEdBQXZCLFVBQXdCLFdBQW1CO1FBQ3ZDLElBQU0sT0FBTyxHQUFHLHFCQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUksR0FBRyxFQUFDLENBQUMsYUFBYTtRQUMzRSxJQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZTtRQUM3RCxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0ssNkJBQWMsR0FBdEIsVUFBdUIsV0FBbUI7UUFDdEMsSUFBTSxPQUFPLEdBQUcscUJBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBSSxHQUFHLEVBQUMsQ0FBQyxhQUFhO1FBQzNFLElBQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlO1FBQzdELE1BQU0sQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ3BELENBQUM7SUFFTSxtQkFBSSxHQUFYO1FBQ0ksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTNCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUM1QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQztJQUNMLENBQUM7SUFFTSxtQkFBSSxHQUFYO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTVCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUM1QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDO0lBQ0wsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7O0FDNU9EOzs7O0dBSUc7QUFDSCwwQkFBaUMsS0FBYTtJQUMxQyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRkQsNENBRUM7QUFFRDs7Ozs7R0FLRztBQUNILG1CQUEwQixHQUFXLEVBQUUsR0FBVztJQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUZELDhCQUVDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsZUFBc0IsS0FBYSxFQUFFLEdBQWtCLEVBQUUsR0FBaUI7SUFBckMsNkJBQWUsR0FBRztJQUFFLCtCQUFpQjtJQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRkQsc0JBRUMiLCJmaWxlIjoiZGlzdC9idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlMTczMWE1MzY2NTM3M2FjYzA3NSIsImltcG9ydCB7IFZpc3VhbGl6ZXIgfSBmcm9tICcuL1Zpc3VhbGl6ZXInO1xuaW1wb3J0IEtleWJvYXJkQ29udHJvbGxlciBmcm9tIFwiLi9LZXlib2FyZENvbnRyb2xsZXJcIjtcbmltcG9ydCBPcmdhbiBmcm9tIFwiLi9PcmdhblwiO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICBjb25zdCBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbiAgICBjb25zdCBvcmdhbiA9IG5ldyBPcmdhbihjb250ZXh0KTtcblxuICAgIC8vIExpbWl0IHRoZSB2b2x1bWVcbiAgICBjb25zdCBkeW5hbWljcyA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIC8vIGR5bmFtaWNzLnRocmVzaG9sZC52YWx1ZSA9IC0yMDtcbiAgICAvLyBkeW5hbWljcy5yYXRpby52YWx1ZSA9IDEwO1xuXG4gICAgY29uc3QgdmlzdWFsaXplciA9IG5ldyBWaXN1YWxpemVyKGNvbnRleHQpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlzdWFsaXplci5lbGVtZW50KTtcblxuICAgIG9yZ2FuLm91dHB1dC5jb25uZWN0KGR5bmFtaWNzKTtcbiAgICBkeW5hbWljcy5jb25uZWN0KHZpc3VhbGl6ZXIuaW5wdXQpO1xuICAgIGR5bmFtaWNzLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG5cbiAgICBuZXcgS2V5Ym9hcmRDb250cm9sbGVyKG9yZ2FuKTtcblxuICAgIC8vIGZvciBkZWJ1Z2dpbmdcbiAgICB3aW5kb3dbJ29yZ2FuJ10gPSBvcmdhbjtcbiAgICB3aW5kb3dbJ2NvbnRleHQnXSA9IGNvbnRleHQ7XG59KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC50cyIsImV4cG9ydCBjbGFzcyBWaXN1YWxpemVyIHtcbiAgICBwdWJsaWMgaW5wdXQ6IEF1ZGlvTm9kZTtcbiAgICBwdWJsaWMgZWxlbWVudDogRWxlbWVudDtcbiAgICBwcml2YXRlIGFuYWx5c2VyOiBBbmFseXNlck5vZGU7XG4gICAgcHJpdmF0ZSBhbmFseXNlckRhdGE6IFVpbnQ4QXJyYXk7XG4gICAgcHJpdmF0ZSBiYXJzOiBBcnJheTxIVE1MRWxlbWVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xuICAgICAgICB0aGlzLmFuYWx5c2VyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG4gICAgICAgIHRoaXMuYW5hbHlzZXIuZmZ0U2l6ZSA9IDIwNDg7XG4gICAgICAgIHRoaXMuYW5hbHlzZXJEYXRhID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudCk7XG4gICAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLmFuYWx5c2VyO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdWaXN1YWxpemVyJyk7XG5cbiAgICAgICAgdGhpcy5iYXJzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBiYXIuY2xhc3NMaXN0LmFkZCgnVmlzdWFsaXplci1iYXInKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChiYXIpO1xuICAgICAgICAgICAgdGhpcy5iYXJzLnB1c2goYmFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3KCkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5kcmF3KCkpO1xuXG4gICAgICAgIHRoaXMuYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEodGhpcy5hbmFseXNlckRhdGEpO1xuXG4gICAgICAgIHRoaXMuYmFycy5mb3JFYWNoKChiYXIsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRCYXJWYWx1ZShpKTtcbiAgICAgICAgICAgIGJhci5zdHlsZS5oZWlnaHQgPSBgJHt2YWx1ZSAqIDEwMH0lYDtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IDAuOTUpIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGMDBgO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA+IDAuOCkge1xuICAgICAgICAgICAgICAgIGJhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgI0ZGMGA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgI0ZGRmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRCYXJWYWx1ZShpOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkYXRhUGVyQmFyID0gdGhpcy5hbmFseXNlckRhdGEubGVuZ3RoIC8gdGhpcy5iYXJzLmxlbmd0aDtcbiAgICAgICAgbGV0IHZhbHVlID0gMDtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBNYXRoLmZsb29yKChpICogZGF0YVBlckJhcikpO1xuICAgICAgICBjb25zdCBlbmQgPSBzdGFydCArIE1hdGguZmxvb3IoZGF0YVBlckJhcik7XG4gICAgICAgIGZvciAobGV0IGogPSBzdGFydDsgaiA8IGVuZDsgaisrKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IE1hdGgubWF4KHRoaXMuYW5hbHlzZXJEYXRhW2pdIC8gMjU2LCB2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuXG4vLyBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuZWxlbWVudDtcbi8vIGNvbnN0IGNhbnZhc0NvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuLy9cbi8vIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYigyMDAsIDIwMCwgMjAwKSc7XG4vLyBjYW52YXNDb250ZXh0LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4vL1xuLy8gY2FudmFzQ29udGV4dC5saW5lV2lkdGggPSAyO1xuLy8gY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9ICdyZ2IoMCwgMCwgMCknO1xuLy9cbi8vIGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG4vLyBjb25zdCBzbGljZVdpZHRoID0gY2FudmFzLndpZHRoIC8gdGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDtcbi8vXG4vLyBmb3IgKGxldCBpID0gMCwgeCA9IDA7IGkgPCB0aGlzLmFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50OyBpKyspIHtcbi8vXG4vLyAgICAgY29uc3QgdiA9IHRoaXMuYW5hbHlzZXJEYXRhW2ldIC8gMTI4LjA7XG4vLyAgICAgY29uc3QgeSA9IHYgKiBjYW52YXMuaGVpZ2h0IC8gMjtcbi8vXG4vLyAgICAgaWYgKGkgPT09IDApIHtcbi8vICAgICAgICAgY2FudmFzQ29udGV4dC5tb3ZlVG8oeCwgeSk7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgY2FudmFzQ29udGV4dC5saW5lVG8oeCwgeSk7XG4vLyAgICAgfVxuLy9cbi8vICAgICB4ICs9IHNsaWNlV2lkdGg7XG4vLyB9XG4vL1xuLy8gY2FudmFzQ29udGV4dC5saW5lVG8oY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0IC8gMik7XG4vLyBjYW52YXNDb250ZXh0LnN0cm9rZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1Zpc3VhbGl6ZXIudHMiLCJpbXBvcnQgT3JnYW4gZnJvbSBcIi4vT3JnYW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5Ym9hcmRDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvcmdhbjogT3JnYW4pIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5jdHJsS2V5ICYmICFldmVudC5tZXRhS2V5ICYmICFldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwaXRjaCA9IHRoaXMua2V5VG9QaXRjaChldmVudC5jb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocGl0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW4ucGxheShwaXRjaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJhbmsgPSB0aGlzLmtleVRvUmFuayhldmVudC5jb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBvcmdhbi50b2dnbGVSYW5rKHJhbmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwaXRjaCA9IHRoaXMua2V5VG9QaXRjaChldmVudC5jb2RlKTtcbiAgICAgICAgICAgIGlmIChwaXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9yZ2FuLnN0b3AocGl0Y2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGtleVRvUGl0Y2goY29kZSk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGtleVBvc2l0aW9uID0gW1xuICAgICAgICAgICAgJ0tleVEnLCAvLyBHI1xuICAgICAgICAgICAgJ0tleUEnLCAvLyBBXG4gICAgICAgICAgICAnS2V5VycsIC8vIEEjXG4gICAgICAgICAgICAnS2V5UycsIC8vIEJcbiAgICAgICAgICAgIC8vICdLZXlFJyxcbiAgICAgICAgICAgICdLZXlEJywgLy8gQ1xuICAgICAgICAgICAgJ0tleVInLCAvLyBDI1xuICAgICAgICAgICAgJ0tleUYnLCAvLyBEXG4gICAgICAgICAgICAnS2V5VCcsIC8vIEQjXG4gICAgICAgICAgICAnS2V5RycsIC8vIEVcbiAgICAgICAgICAgIC8vICdLZXlZJyxcbiAgICAgICAgICAgICdLZXlIJywgLy8gRlxuICAgICAgICAgICAgJ0tleVUnLCAvLyBGI1xuICAgICAgICAgICAgJ0tleUonLCAvLyBHXG4gICAgICAgICAgICAnS2V5SScsIC8vIEcjXG4gICAgICAgICAgICAnS2V5SycsIC8vIEFcbiAgICAgICAgICAgICdLZXlPJywgLy8gQSNcbiAgICAgICAgICAgICdLZXlMJywgLy8gQlxuICAgICAgICAgICAgLy8gJ0tleVAnLFxuICAgICAgICAgICAgJ1NlbWljb2xvbicsIC8vIENcbiAgICAgICAgICAgICdCcmFja2V0TGVmdCcsIC8vIEMjXG4gICAgICAgICAgICAnUXVvdGUnLCAvLyBEXG4gICAgICAgICAgICAnQnJhY2tldFJpZ2h0JywgLy8gRCNcbiAgICAgICAgICAgICdFbnRlcicsIC8vIEVcbiAgICAgICAgXS5pbmRleE9mKGNvZGUpO1xuICAgICAgICBpZiAoa2V5UG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleVBvc2l0aW9uIC0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGtleVRvUmFuayhjb2RlKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qga2V5UG9zaXRpb24gPSBbXG4gICAgICAgICAgICAnRGlnaXQxJyxcbiAgICAgICAgICAgICdEaWdpdDInLFxuICAgICAgICAgICAgJ0RpZ2l0MycsXG4gICAgICAgICAgICAnRGlnaXQ0JyxcbiAgICAgICAgICAgICdEaWdpdDUnLFxuICAgICAgICAgICAgJ0RpZ2l0NicsXG4gICAgICAgICAgICAnRGlnaXQ3JyxcbiAgICAgICAgICAgICdEaWdpdDgnLFxuICAgICAgICAgICAgJ0RpZ2l0OSdcblxuICAgICAgICBdLmluZGV4T2YoY29kZSk7XG4gICAgICAgIGlmIChrZXlQb3NpdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5UG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9LZXlib2FyZENvbnRyb2xsZXIudHMiLCJpbXBvcnQgeyBwaXRjaFRvRnJlcXVlbmN5LCBjbGFtcCB9IGZyb20gJy4vdXRpbCc7XG5cbi8vIFRPRE86IERvbid0IGhhdmUgc28gbWFueSBvc2NpbGxhdG9ycyBhbGwgdGhlIHRpbWUuIEFuZCBmaWd1cmUgb3V0IG90aGVyIHdheXMgdG8gcmVkdWNlIGNvbXB1dGF0aW9uLlxuXG4vKipcbiAqIEFuIG9yZ2FuIGlzIGEgY29sbGVjdGlvbiBvZiByYW5rcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JnYW4ge1xuICAgIHByaXZhdGUgcmFua3M6IEFycmF5PFJhbms+O1xuICAgIHB1YmxpYyBvdXRwdXQ6IEF1ZGlvTm9kZTtcbiAgICBwcml2YXRlIGFjdGl2ZVJhbmtzOiBBcnJheTxSYW5rPjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xuICAgICAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgICAgIGNvbnN0IHRyZW11bGF0b3JPc2NpbGxhdG9yID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIHRyZW11bGF0b3JPc2NpbGxhdG9yLmZyZXF1ZW5jeS52YWx1ZSA9IDMuMDtcbiAgICAgICAgdHJlbXVsYXRvck9zY2lsbGF0b3Iuc3RhcnQoKTtcbiAgICAgICAgY29uc3QgdHJlbXVsYXRvclN0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRyZW11bGF0b3JPc2NpbGxhdG9yLmNvbm5lY3QodHJlbXVsYXRvclN0cmVuZ3RoKTtcbiAgICAgICAgdHJlbXVsYXRvclN0cmVuZ3RoLmdhaW4udmFsdWUgPSAwLjI7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVSYW5rcyA9IFtdO1xuICAgICAgICB0aGlzLnJhbmtzID0gW107XG4gICAgICAgIHRoaXMucmFua3MucHVzaChuZXcgUmFuayhjb250ZXh0LCB0cmVtdWxhdG9yU3RyZW5ndGgsIC0zNikpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMjQpKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgLTEyKSk7XG4gICAgICAgIHRoaXMucmFua3MucHVzaChuZXcgUmFuayhjb250ZXh0LCB0cmVtdWxhdG9yU3RyZW5ndGgsIDApKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMTIpKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMjQpKTtcbiAgICAgICAgLy8gdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMzYpKTtcbiAgICAgICAgdGhpcy5yYW5rcy5mb3JFYWNoKChyYW5rKSA9PiByYW5rLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0KSlcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNSYW5rQWN0aXZlKHJhbmtJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVJhbmtzLmluZGV4T2YodGhpcy5yYW5rc1tyYW5rSW5kZXhdKSA+PSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVSYW5rKHJhbmtJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5pc1JhbmtBY3RpdmUocmFua0luZGV4KSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhY3RpdmF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgY29uc3QgcmFuayA9IHRoaXMucmFua3NbcmFua0luZGV4XTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlUmFua3MuaW5kZXhPZihyYW5rKSA9PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVSYW5rcy5wdXNoKHJhbmspO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEFjdGl2YXRlIHJhbmsgJHtyYW5rSW5kZXh9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgY29uc3QgcmFuayA9IHRoaXMucmFua3NbcmFua0luZGV4XTtcbiAgICAgICAgY29uc3QgYWN0aXZlUmFua0luZGV4ID0gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHJhbmspO1xuICAgICAgICBpZiAoYWN0aXZlUmFua0luZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLnNwbGljZShhY3RpdmVSYW5rSW5kZXgsIDEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlYWN0aXZhdGUgcmFuayAke3JhbmtJbmRleH1gKTtcbiAgICAgICAgICAgIHJhbmsuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJhbmtJbmRleCA8IDAgfHwgcmFua0luZGV4ID49IHRoaXMucmFua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW52YWxpZCBSYW5rOiAke3JhbmtJbmRleH1gKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLmZvckVhY2goKHJhbmspID0+IHtcbiAgICAgICAgICAgIHJhbmsucGxheShwaXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKHBpdGNoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmVSYW5rcy5mb3JFYWNoKChyYW5rKSA9PiB7XG4gICAgICAgICAgICByYW5rLnN0b3AocGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSByYW5rIGlzIGEgc2V0IG9mIHBpcGVzLlxuICovXG5jbGFzcyBSYW5rIHtcbiAgICBwcml2YXRlIHBpcGVzOiB7IFtwaXRjaDogbnVtYmVyXTogUGlwZSB9O1xuICAgIHB1YmxpYyBvdXRwdXQ6IEF1ZGlvTm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCwgdHJlbXVsYXRvcjogQXVkaW9Ob2RlLCBvZmZzZXQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBnYWluID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IDAuMTtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBnYWluO1xuXG4gICAgICAgIHRoaXMucGlwZXMgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IC0xOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGlwZSA9IG5ldyBQaXBlKGNvbnRleHQsIGkgKyBvZmZzZXQsIHRyZW11bGF0b3IpO1xuICAgICAgICAgICAgcGlwZS5vdXRwdXQuY29ubmVjdChnYWluKTtcbiAgICAgICAgICAgIHRoaXMucGlwZXNbaV0gPSBwaXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5wbGF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5zdG9wKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BBbGwoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgcGl0Y2ggaW4gdGhpcy5waXBlcykge1xuICAgICAgICAgICAgdGhpcy5waXBlc1twaXRjaF0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBQaXBlIHtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBnYWluOiBHYWluTm9kZTtcbiAgICBwcml2YXRlIHBpdGNoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoaWdocGFzczogQmlxdWFkRmlsdGVyTm9kZTtcbiAgICBwcml2YXRlIHBsYXlpbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBtYXhHYWluOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQsIHBpdGNoOiBudW1iZXIsIHRyZW11bGF0b3I6IEF1ZGlvTm9kZSkge1xuICAgICAgICB0aGlzLnBpdGNoID0gcGl0Y2g7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1heEdhaW4gPSAwLjE7XG5cbiAgICAgICAgdGhpcy5nYWluID0gY29udGV4dC5jcmVhdGVHYWluKCk7IC8vIE1haW4gdm9sdW1lIGNvbnRyb2xcbiAgICAgICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMuZ2FpbjtcblxuICAgICAgICB0aGlzLmhpZ2hwYXNzID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcblxuICAgICAgICAvLyBDcmVhdGVzIHRoZSBzb3VuZFxuICAgICAgICBjb25zdCBvc2NpbGxhdG9yID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIG9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gcGl0Y2hUb0ZyZXF1ZW5jeShwaXRjaCk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQpKTtcblxuICAgICAgICAvLyBUcmVtZWxvXG4gICAgICAgIGNvbnN0IHRyZW1lbG8gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgY29uc3QgdHJlbWVsb1N0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRyZW1lbG9TdHJlbmd0aC5nYWluLnZhbHVlID0gMS4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodHJlbWVsb1N0cmVuZ3RoKTtcbiAgICAgICAgdHJlbWVsb1N0cmVuZ3RoLmNvbm5lY3QodHJlbWVsby5nYWluKTtcblxuICAgICAgICAvLyBWaWJyYXRvXG4gICAgICAgIGNvbnN0IHZpYnJhdG9QaXRjaFN0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZpYnJhdG9QaXRjaFN0cmVuZ3RoLmdhaW4udmFsdWUgPSAxMC4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodmlicmF0b1BpdGNoU3RyZW5ndGgpO1xuICAgICAgICAvLyB2aWJyYXRvUGl0Y2hTdHJlbmd0aC5jb25uZWN0KG9zY2lsbGF0b3IuZGV0dW5lKTtcblxuICAgICAgICBvc2NpbGxhdG9yLmNvbm5lY3QodHJlbWVsbyk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc3RhcnQoKTtcblxuICAgICAgICAvLyB0cmVtZWxvLmNvbm5lY3QodGhpcy5oaWdocGFzcyk7XG4gICAgICAgIC8vIHRoaXMuaGlnaHBhc3MuY29ubmVjdCh0aGlzLmdhaW4pO1xuICAgICAgICB0cmVtZWxvLmNvbm5lY3QodGhpcy5nYWluKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgdGhlIHNwZWN0cnVtIGZvciB0aGUgcGlwZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqIEByZXR1cm4ge1BlcmlvZGljV2F2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFBlcmlvZGljV2F2ZShjb250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgY29uc3QgTlVNQkVSX09GX0hBUk1PTklDUyA9IDE2O1xuICAgICAgICBjb25zdCBFVkVOX0NPRUZGSUNJRU5UID0gMC4zO1xuICAgICAgICBjb25zdCBERUNBWSA9IDMuNTtcblxuICAgICAgICBjb25zdCByZWFsID0gbmV3IEZsb2F0MzJBcnJheShOVU1CRVJfT0ZfSEFSTU9OSUNTKTtcbiAgICAgICAgY29uc3QgaW1hZyA9IG5ldyBGbG9hdDMyQXJyYXkoTlVNQkVSX09GX0hBUk1PTklDUyk7XG4gICAgICAgIHJlYWxbMF0gPSAwO1xuICAgICAgICBpbWFnWzBdID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBOVU1CRVJfT0ZfSEFSTU9OSUNTOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpICUgMiA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcmVhbFtpXSA9IDEuMCAvIChpICoqIERFQ0FZKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVhbFtpXSA9IEVWRU5fQ09FRkZJQ0lFTlQgLyAoaSAqKiBERUNBWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbWFnW2ldID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBDaGlmZlxuXG4gICAgICAgIHJldHVybiBjb250ZXh0LmNyZWF0ZVBlcmlvZGljV2F2ZShyZWFsLCBpbWFnLCB7ZGlzYWJsZU5vcm1hbGl6YXRpb246IHRydWV9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRpbWUgdG8gd2FybSB1cFxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0QXR0YWNrTGVuZ3RoKGN1cnJlbnRHYWluOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwZXJjZW50ID0gY2xhbXAoKHRoaXMucGl0Y2ggKyAzNikgLyA3MiwgMCwgMS4wKSAqKiAxLjU7IC8vIFswLjAsIDEuMF1cbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gMC41IC8gKDEuMCArIDE5ICogcGVyY2VudCk7IC8vIFswLjAyNSwgMC41XVxuICAgICAgICByZXR1cm4gKDEuMCAtIGN1cnJlbnRHYWluIC8gdGhpcy5tYXhHYWluKSAqIG1heExlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRpbWUgdG8gY29vbCBkb3duXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREZWNheUxlbmd0aChjdXJyZW50R2FpbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IGNsYW1wKCh0aGlzLnBpdGNoICsgMzYpIC8gNzIsIDAsIDEuMCkgKiogMS41OyAvLyBbMC4wLCAxLjBdXG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IDAuNSAvICgxLjAgKyAxOSAqIHBlcmNlbnQpOyAvLyBbMC4wMjUsIDAuNV1cbiAgICAgICAgcmV0dXJuIChjdXJyZW50R2FpbiAvIHRoaXMubWF4R2FpbikgKiBtYXhMZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkoKSB7XG4gICAgICAgIGlmICghdGhpcy5wbGF5aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BpcGUgcGxheWVkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHRoaXMub3V0cHV0LmNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50R2FpbiA9IHRoaXMuZ2Fpbi5nYWluLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2Fpbiwgbm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMubWF4R2Fpbiwgbm93ICsgdGhpcy5nZXRBdHRhY2tMZW5ndGgoY3VycmVudEdhaW4pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy5wbGF5aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwaXBlIHN0b3BwZWQnKTtcblxuICAgICAgICAgICAgY29uc3Qgbm93ID0gdGhpcy5vdXRwdXQuY29udGV4dC5jdXJyZW50VGltZTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRHYWluID0gdGhpcy5nYWluLmdhaW4udmFsdWU7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMobm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRHYWluLCBub3cpO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgbm93ICsgdGhpcy5nZXREZWNheUxlbmd0aChjdXJyZW50R2FpbikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL09yZ2FuLnRzIiwiLyoqXG4gKiBDb252ZXJ0cyBhIHBpdGNoIGdpdmUgaW4gc2VtaXRvbmVzIGFib3ZlIEE0IHRvIGEgZnJlcXVlbmN5IGluIEh6LlxuICogQHBhcmFtIHBpdGNoXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaXRjaFRvRnJlcXVlbmN5KHBpdGNoOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiA0NDAgKiBNYXRoLnBvdygyLCBwaXRjaCAvIDEyLjApO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgcmFuZG9tIGludGVnZXIgaW4gdGhlIHJhbmdlIFttaW4sIG1heClcbiAqIEBwYXJhbSBtaW5cbiAqIEBwYXJhbSBtYXhcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUludChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG59XG5cbi8qKlxuICogQ2xhbXAgdmFsdWUgdG8gdGhlIHJhbmdlIFttaW4sIG1heF1cbiAqIEBwYXJhbSB2YWx1ZVxuICogQHBhcmFtIG1pblxuICogQHBhcmFtIG1heFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAodmFsdWU6IG51bWJlciwgbWluOiBudW1iZXIgPSAtMS4wLCBtYXg6IG51bWJlciA9IDEuMCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKHZhbHVlLCBtYXgpLCBtaW4pO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==