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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/**
 * Loads a sound from a filename.
 * @param context
 * @param filename
 * @return {Promise<Response>}
 */
function loadSound(context, filename) {
    return fetch("sounds/" + filename)
        .then(function (response) { return response.arrayBuffer(); })
        .then(function (arrayBuffer) { return context.decodeAudioData(arrayBuffer); });
}
exports.loadSound = loadSound;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var util_1 = __webpack_require__(0);
var Visualizer_1 = __webpack_require__(2);
var KeyboardController_1 = __webpack_require__(3);
var Organ_1 = __webpack_require__(4);
window.addEventListener('load', function () {
    var context = new (AudioContext)();
    var organ = new Organ_1["default"](context);
    organ.activateRanks(0, 1, 2, 3, 4, 5);
    var reverb = context.createConvolver();
    // Limit the volume
    var dynamics = context.createDynamicsCompressor();
    dynamics.threshold.value = -20;
    dynamics.ratio.value = 10;
    var visualizer = new Visualizer_1.Visualizer(context);
    document.body.appendChild(visualizer.element);
    var wet = context.createGain();
    var dry = context.createGain();
    function setReverbAmount(amount) {
        wet.gain.setTargetAtTime(Math.sqrt(amount), context.currentTime, 0.01);
        dry.gain.setTargetAtTime(Math.sqrt(1.0 - amount), context.currentTime, 0.01);
    }
    organ.output.connect(reverb);
    organ.output.connect(dry);
    reverb.connect(wet);
    wet.connect(dynamics);
    dry.connect(dynamics);
    dynamics.connect(visualizer.input);
    dynamics.connect(context.destination);
    setReverbAmount(0.0); // Turn reverb off until sound loads
    util_1.loadSound(context, 'stalbans_a_ortf.wav')
        .then(function (audioBuffer) {
        reverb.buffer = audioBuffer;
        setReverbAmount(1.0); // enable reverb once sound loads
    })["catch"](function (error) { return console.error(error); });
    new KeyboardController_1["default"](organ);
    // for debugging
    window['organ'] = organ;
    window['context'] = context;
    document.addEventListener('keydown', function (event) {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.code == 'KeyZ') {
                setReverbAmount(1.0);
            }
            else if (event.code == 'KeyX') {
                setReverbAmount(0.5);
            }
            else if (event.code == 'KeyC') {
                setReverbAmount(0.0);
            }
        }
    });
});


/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var KeyboardController = (function () {
    function KeyboardController(organ) {
        var _this = this;
        document.addEventListener('keydown', function (event) {
            if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                var pitch = KeyboardController.keyToPitch(event.code);
                if (pitch !== null) {
                    organ.play(pitch);
                }
                var rank = KeyboardController.keyToRank(event.code);
                if (rank !== null) {
                    organ.toggleRank(rank);
                }
            }
        });
        document.addEventListener('keyup', function (event) {
            var pitch = KeyboardController.keyToPitch(event.code);
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var util_1 = __webpack_require__(0);
// TODO: Don't have so many oscillators all the time. And figure out other ways to reduce computation.
/**
 * An organ is a collection of ranks.
 */
var Organ = (function () {
    function Organ(context) {
        var _this = this;
        var gain = this.output = context.createGain();
        gain.gain.value = 0.1;
        var tremulatorOscillator = context.createOscillator();
        tremulatorOscillator.frequency.value = 3.0;
        tremulatorOscillator.start();
        var tremulatorStrength = context.createGain();
        tremulatorOscillator.connect(tremulatorStrength);
        tremulatorStrength.gain.value = 0.2;
        this.activeRanks = [];
        this.ranks = [];
        this.ranks.push(new Rank(context, tremulatorStrength, -36, 2.0));
        this.ranks.push(new Rank(context, tremulatorStrength, -24, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, -12, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, 0, 1.0));
        this.ranks.push(new Rank(context, tremulatorStrength, 12, 0.7));
        this.ranks.push(new Rank(context, tremulatorStrength, 24, 0.5));
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
    Organ.prototype.activateRanks = function () {
        var _this = this;
        var rankIndexes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rankIndexes[_i] = arguments[_i];
        }
        rankIndexes.forEach(function (rankIndex) { return _this.activateRank(rankIndex); });
    };
    Organ.prototype.deactivateRanks = function () {
        var _this = this;
        var rankIndexes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rankIndexes[_i] = arguments[_i];
        }
        rankIndexes.forEach(function (rankIndex) { return _this.deactivateRank(rankIndex); });
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
    function Rank(context, tremulator, offset, gainAmount) {
        var gain = context.createGain();
        gain.gain.value = gainAmount;
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
        // vibratoPitchStrength.connect(oscillator.detune); // causes stuttering for some reason
        // Left/Right pan
        var panner = context.createStereoPanner();
        panner.pan.value = util_1.clamp(this.pitch / 48, -1.0, 1.0);
        oscillator.connect(tremelo);
        oscillator.start();
        tremelo.connect(panner);
        panner.connect(this.gain);
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
        var maxLength = 0.2 / (1.0 + 19 * percent); // [0.01, 0.2]
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


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWFhYTM4MzliNDAzM2E0ZTNmOGEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9WaXN1YWxpemVyLnRzIiwid2VicGFjazovLy8uL3NyYy9LZXlib2FyZENvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL09yZ2FuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQTs7OztHQUlHO0FBQ0gsMEJBQWlDLEtBQWE7SUFDMUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUZELDRDQUVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxtQkFBMEIsR0FBVyxFQUFFLEdBQVc7SUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCw4QkFFQztBQUVEOzs7Ozs7R0FNRztBQUNILGVBQXNCLEtBQWEsRUFBRSxHQUFrQixFQUFFLEdBQWlCO0lBQXJDLDZCQUFlLEdBQUc7SUFBRSwrQkFBaUI7SUFDdEUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUZELHNCQUVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxtQkFBMEIsT0FBcUIsRUFBRSxRQUFnQjtJQUM3RCxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVUsUUFBVSxDQUFDO1NBQzdCLElBQUksQ0FBQyxVQUFDLFFBQWtCLElBQUssZUFBUSxDQUFDLFdBQVcsRUFBRSxFQUF0QixDQUFzQixDQUFDO1NBQ3BELElBQUksQ0FBQyxVQUFDLFdBQXdCLElBQUssY0FBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFKRCw4QkFJQzs7Ozs7Ozs7OztBQ3hDRCxvQ0FBbUM7QUFDbkMsMENBQTBDO0FBQzFDLGtEQUFzRDtBQUN0RCxxQ0FBNEI7QUFFNUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtJQUM1QixJQUFNLE9BQU8sR0FBaUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7SUFDbkQsSUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0QyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7SUFFekMsbUJBQW1CO0lBQ25CLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ3BELFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQy9CLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUUxQixJQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqQyxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFakMseUJBQXlCLE1BQWM7UUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QixHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXRDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLG9DQUFvQztJQUMxRCxnQkFBUyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQztTQUNwQyxJQUFJLENBQUMscUJBQVc7UUFDYixNQUFNLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztRQUM1QixlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpQ0FBaUM7SUFDM0QsQ0FBQyxDQUFDLENBQUMsT0FBSyxFQUFDLFVBQUMsS0FBSyxJQUFLLGNBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQztJQUU5QyxJQUFJLCtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTlCLGdCQUFnQjtJQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7SUFHNUIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLEtBQUs7UUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUM1REg7SUFPSSxvQkFBWSxZQUEwQjtRQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFCLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFTSx5QkFBSSxHQUFYO1FBQUEsaUJBaUJDO1FBaEJHLHFCQUFxQixDQUFDLGNBQU0sWUFBSSxDQUFDLElBQUksRUFBRSxFQUFYLENBQVcsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxLQUFLLEdBQUcsR0FBRyxNQUFHLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQ3ZDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztZQUN2QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTyxnQ0FBVyxHQUFuQixVQUFvQixDQUFTO1FBQ3pCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQy9ELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9CLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQztRQUN2RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQUFDO0FBeERZLGdDQUFVO0FBMER2QixtREFBbUQ7QUFDbkQsaURBQWlEO0FBQ2pELEVBQUU7QUFDRixrREFBa0Q7QUFDbEQsNkRBQTZEO0FBQzdELEVBQUU7QUFDRiwrQkFBK0I7QUFDL0IsOENBQThDO0FBQzlDLEVBQUU7QUFDRiw2QkFBNkI7QUFDN0IscUVBQXFFO0FBQ3JFLEVBQUU7QUFDRixxRUFBcUU7QUFDckUsRUFBRTtBQUNGLDhDQUE4QztBQUM5Qyx1Q0FBdUM7QUFDdkMsRUFBRTtBQUNGLHFCQUFxQjtBQUNyQixzQ0FBc0M7QUFDdEMsZUFBZTtBQUNmLHNDQUFzQztBQUN0QyxRQUFRO0FBQ1IsRUFBRTtBQUNGLHVCQUF1QjtBQUN2QixJQUFJO0FBQ0osRUFBRTtBQUNGLHlEQUF5RDtBQUN6RCwwQkFBMEI7Ozs7Ozs7Ozs7QUNuRjFCO0lBQ0ksNEJBQVksS0FBWTtRQUF4QixpQkFtQkM7UUFsQkcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLEtBQUs7WUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQ0QsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUs7WUFDckMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHVDQUFVLEdBQWxCLFVBQW1CLElBQUk7UUFDbkIsSUFBTSxXQUFXLEdBQUc7WUFDaEIsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLFVBQVU7WUFDVixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLFVBQVU7WUFDVixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sVUFBVTtZQUNWLFdBQVc7WUFDWCxhQUFhO1lBQ2IsT0FBTztZQUNQLGNBQWM7WUFDZCxPQUFPO1NBQ1YsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLHNDQUFTLEdBQWpCLFVBQWtCLElBQUk7UUFDbEIsSUFBTSxXQUFXLEdBQUc7WUFDaEIsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixRQUFRO1NBRVgsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN2QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0wseUJBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7OztBQzNFRCxvQ0FBaUQ7QUFFakQsc0dBQXNHO0FBRXRHOztHQUVHO0FBQ0g7SUFLSSxlQUFZLE9BQXFCO1FBQWpDLGlCQXFCQztRQXBCRyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFFdEIsSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4RCxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUMzQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUVwQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRSw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLElBQUssV0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ2xFLENBQUM7SUFFTSw0QkFBWSxHQUFuQixVQUFvQixTQUFpQjtRQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTSwwQkFBVSxHQUFqQixVQUFrQixTQUFpQjtRQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLDRCQUFZLEdBQW5CLFVBQW9CLFNBQWlCO1FBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsU0FBVyxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7SUFFTSw2QkFBYSxHQUFwQjtRQUFBLGlCQUVDO1FBRm9CLHFCQUE2QjthQUE3QixVQUE2QixFQUE3QixxQkFBNkIsRUFBN0IsSUFBNkI7WUFBN0IsZ0NBQTZCOztRQUM5QyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBUyxJQUFLLFlBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQTVCLENBQTRCLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sK0JBQWUsR0FBdEI7UUFBQSxpQkFFQztRQUZzQixxQkFBNkI7YUFBN0IsVUFBNkIsRUFBN0IscUJBQTZCLEVBQTdCLElBQTZCO1lBQTdCLGdDQUE2Qjs7UUFDaEQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQVMsSUFBSyxZQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVNLDhCQUFjLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxFQUFFLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFtQixTQUFXLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFFTyw0QkFBWSxHQUFwQixVQUFxQixTQUFpQjtRQUNsQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxJQUFJLFVBQVUsQ0FBQyxtQkFBaUIsU0FBVyxDQUFDO1FBQ3RELENBQUM7SUFDTCxDQUFDO0lBRU0sb0JBQUksR0FBWCxVQUFZLEtBQWE7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sb0JBQUksR0FBWCxVQUFZLEtBQWE7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsWUFBQztBQUFELENBQUM7O0FBRUQ7O0dBRUc7QUFDSDtJQUlJLGNBQVksT0FBcUIsRUFBRSxVQUFxQixFQUFFLE1BQWMsRUFBRSxVQUFrQjtRQUN4RixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQixJQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVNLG1CQUFJLEdBQVgsVUFBWSxLQUFhO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVNLG1CQUFJLEdBQVgsVUFBWSxLQUFhO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVNLHNCQUFPLEdBQWQ7UUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7SUFDTCxDQUFDO0lBQ0wsV0FBQztBQUFELENBQUM7QUFFRDtJQU9JLGNBQVksT0FBcUIsRUFBRSxLQUFhLEVBQUUsVUFBcUI7UUFDbkUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFFbkIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxzQkFBc0I7UUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFHeEIsb0JBQW9CO1FBQ3BCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzlDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLHVCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRTFELFVBQVU7UUFDVixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckMsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQyxVQUFVLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLFVBQVU7UUFDVixJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN2QyxVQUFVLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDekMsd0ZBQXdGO1FBRXhGLGlCQUFpQjtRQUNqQixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxZQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFckQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLDhCQUFlLEdBQXZCLFVBQXdCLE9BQXFCO1FBQ3pDLElBQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO1FBQzdCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUVsQixJQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ25ELElBQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFDLEVBQUksS0FBSyxFQUFDLENBQUM7WUFDakMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsR0FBRyxDQUFDLFVBQUMsRUFBSSxLQUFLLEVBQUMsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDO1FBQ0QsY0FBYztRQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFDLG9CQUFvQixFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVEOztPQUVHO0lBQ0ssOEJBQWUsR0FBdkIsVUFBd0IsV0FBbUI7UUFDdkMsSUFBTSxPQUFPLEdBQUcscUJBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBSSxHQUFHLEVBQUMsQ0FBQyxhQUFhO1FBQzNFLElBQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxjQUFjO1FBQzVELE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDSyw2QkFBYyxHQUF0QixVQUF1QixXQUFtQjtRQUN0QyxJQUFNLE9BQU8sR0FBRyxxQkFBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFJLEdBQUcsRUFBQyxDQUFDLGFBQWE7UUFDM0UsSUFBTSxTQUFTLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWU7UUFDN0QsTUFBTSxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDcEQsQ0FBQztJQUVNLG1CQUFJLEdBQVg7UUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFM0IsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQzVDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO0lBQ0wsQ0FBQztJQUVNLG1CQUFJLEdBQVg7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFNUIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQzVDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7SUFDTCxDQUFDO0lBQ0wsV0FBQztBQUFELENBQUMiLCJmaWxlIjoiZGlzdC9idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAxYWFhMzgzOWI0MDMzYTRlM2Y4YSIsIi8qKlxuICogQ29udmVydHMgYSBwaXRjaCBnaXZlIGluIHNlbWl0b25lcyBhYm92ZSBBNCB0byBhIGZyZXF1ZW5jeSBpbiBIei5cbiAqIEBwYXJhbSBwaXRjaFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGl0Y2hUb0ZyZXF1ZW5jeShwaXRjaDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gNDQwICogTWF0aC5wb3coMiwgcGl0Y2ggLyAxMi4wKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHJhbmRvbSBpbnRlZ2VyIGluIHRoZSByYW5nZSBbbWluLCBtYXgpXG4gKiBAcGFyYW0gbWluXG4gKiBAcGFyYW0gbWF4XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21JbnQobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xufVxuXG4vKipcbiAqIENsYW1wIHZhbHVlIHRvIHRoZSByYW5nZSBbbWluLCBtYXhdXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBtaW5cbiAqIEBwYXJhbSBtYXhcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyID0gLTEuMCwgbWF4OiBudW1iZXIgPSAxLjApOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1pbih2YWx1ZSwgbWF4KSwgbWluKTtcbn1cblxuLyoqXG4gKiBMb2FkcyBhIHNvdW5kIGZyb20gYSBmaWxlbmFtZS5cbiAqIEBwYXJhbSBjb250ZXh0XG4gKiBAcGFyYW0gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1Byb21pc2U8UmVzcG9uc2U+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZFNvdW5kKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCwgZmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8QXVkaW9CdWZmZXI+IHtcbiAgICByZXR1cm4gZmV0Y2goYHNvdW5kcy8ke2ZpbGVuYW1lfWApXG4gICAgICAgIC50aGVuKChyZXNwb25zZTogUmVzcG9uc2UpID0+IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkpXG4gICAgICAgIC50aGVuKChhcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXIpID0+IGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGFycmF5QnVmZmVyKSk7XG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWwudHMiLCJpbXBvcnQgeyBsb2FkU291bmQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgVmlzdWFsaXplciB9IGZyb20gJy4vVmlzdWFsaXplcic7XG5pbXBvcnQgS2V5Ym9hcmRDb250cm9sbGVyIGZyb20gXCIuL0tleWJvYXJkQ29udHJvbGxlclwiO1xuaW1wb3J0IE9yZ2FuIGZyb20gXCIuL09yZ2FuXCI7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IG5ldyAoQXVkaW9Db250ZXh0KSgpO1xuICAgIGNvbnN0IG9yZ2FuID0gbmV3IE9yZ2FuKGNvbnRleHQpO1xuICAgIG9yZ2FuLmFjdGl2YXRlUmFua3MoMCwgMSwgMiwgMywgNCwgNSk7XG4gICAgY29uc3QgcmV2ZXJiID0gY29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcblxuICAgIC8vIExpbWl0IHRoZSB2b2x1bWVcbiAgICBjb25zdCBkeW5hbWljcyA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XG4gICAgZHluYW1pY3MudGhyZXNob2xkLnZhbHVlID0gLTIwO1xuICAgIGR5bmFtaWNzLnJhdGlvLnZhbHVlID0gMTA7XG5cbiAgICBjb25zdCB2aXN1YWxpemVyID0gbmV3IFZpc3VhbGl6ZXIoY29udGV4dCk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aXN1YWxpemVyLmVsZW1lbnQpO1xuXG4gICAgY29uc3Qgd2V0ID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgY29uc3QgZHJ5ID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG5cbiAgICBmdW5jdGlvbiBzZXRSZXZlcmJBbW91bnQoYW1vdW50OiBudW1iZXIpIHtcbiAgICAgICAgd2V0LmdhaW4uc2V0VGFyZ2V0QXRUaW1lKE1hdGguc3FydChhbW91bnQpLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgZHJ5LmdhaW4uc2V0VGFyZ2V0QXRUaW1lKE1hdGguc3FydCgxLjAgLSBhbW91bnQpLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICB9XG5cbiAgICBvcmdhbi5vdXRwdXQuY29ubmVjdChyZXZlcmIpO1xuICAgIG9yZ2FuLm91dHB1dC5jb25uZWN0KGRyeSk7XG4gICAgcmV2ZXJiLmNvbm5lY3Qod2V0KTtcbiAgICB3ZXQuY29ubmVjdChkeW5hbWljcyk7XG4gICAgZHJ5LmNvbm5lY3QoZHluYW1pY3MpO1xuICAgIGR5bmFtaWNzLmNvbm5lY3QodmlzdWFsaXplci5pbnB1dCk7XG4gICAgZHluYW1pY3MuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAgIHNldFJldmVyYkFtb3VudCgwLjApOyAvLyBUdXJuIHJldmVyYiBvZmYgdW50aWwgc291bmQgbG9hZHNcbiAgICBsb2FkU291bmQoY29udGV4dCwgJ3N0YWxiYW5zX2Ffb3J0Zi53YXYnKVxuICAgICAgICAudGhlbihhdWRpb0J1ZmZlciA9PiB7XG4gICAgICAgICAgICByZXZlcmIuYnVmZmVyID0gYXVkaW9CdWZmZXI7XG4gICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMS4wKTsgLy8gZW5hYmxlIHJldmVyYiBvbmNlIHNvdW5kIGxvYWRzXG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuXG4gICAgbmV3IEtleWJvYXJkQ29udHJvbGxlcihvcmdhbik7XG5cbiAgICAvLyBmb3IgZGVidWdnaW5nXG4gICAgd2luZG93WydvcmdhbiddID0gb3JnYW47XG4gICAgd2luZG93Wydjb250ZXh0J10gPSBjb250ZXh0O1xuXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQubWV0YUtleSAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZSA9PSAnS2V5WicpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMS4wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5WCcpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMC41KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5QycpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMC4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXgudHMiLCJleHBvcnQgY2xhc3MgVmlzdWFsaXplciB7XG4gICAgcHVibGljIGlucHV0OiBBdWRpb05vZGU7XG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhbmFseXNlcjogQW5hbHlzZXJOb2RlO1xuICAgIHByaXZhdGUgYW5hbHlzZXJEYXRhOiBVaW50OEFycmF5O1xuICAgIHByaXZhdGUgYmFyczogQXJyYXk8SFRNTEVsZW1lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgdGhpcy5hbmFseXNlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICAgICAgICB0aGlzLmFuYWx5c2VyLmZmdFNpemUgPSAyMDQ4O1xuICAgICAgICB0aGlzLmFuYWx5c2VyRGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpO1xuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5hbmFseXNlcjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnVmlzdWFsaXplcicpO1xuXG4gICAgICAgIHRoaXMuYmFycyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI0OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYmFyLmNsYXNzTGlzdC5hZGQoJ1Zpc3VhbGl6ZXItYmFyJyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoYmFyKTtcbiAgICAgICAgICAgIHRoaXMuYmFycy5wdXNoKGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdygpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZHJhdygpKTtcblxuICAgICAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKHRoaXMuYW5hbHlzZXJEYXRhKTtcblxuICAgICAgICB0aGlzLmJhcnMuZm9yRWFjaCgoYmFyLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0QmFyVmFsdWUoaSk7XG4gICAgICAgICAgICBiYXIuc3R5bGUuaGVpZ2h0ID0gYCR7dmFsdWUgKiAxMDB9JWA7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAwLjk1KSB7XG4gICAgICAgICAgICAgICAgYmFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGAjRjAwYDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPiAwLjgpIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRjBgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRkZgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QmFyVmFsdWUoaTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZGF0YVBlckJhciA9IHRoaXMuYW5hbHlzZXJEYXRhLmxlbmd0aCAvIHRoaXMuYmFycy5sZW5ndGg7XG4gICAgICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5mbG9vcigoaSAqIGRhdGFQZXJCYXIpKTtcbiAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBNYXRoLmZsb29yKGRhdGFQZXJCYXIpO1xuICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBlbmQ7IGorKykge1xuICAgICAgICAgICAgdmFsdWUgPSBNYXRoLm1heCh0aGlzLmFuYWx5c2VyRGF0YVtqXSAvIDI1NiwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cblxuLy8gY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLmVsZW1lbnQ7XG4vLyBjb25zdCBjYW52YXNDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbi8vXG4vLyBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoMjAwLCAyMDAsIDIwMCknO1xuLy8gY2FudmFzQ29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVdpZHRoID0gMjtcbi8vIGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSAncmdiKDAsIDAsIDApJztcbi8vXG4vLyBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuLy8gY29uc3Qgc2xpY2VXaWR0aCA9IGNhbnZhcy53aWR0aCAvIHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQ7XG4vL1xuLy8gZm9yIChsZXQgaSA9IDAsIHggPSAwOyBpIDwgdGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDsgaSsrKSB7XG4vL1xuLy8gICAgIGNvbnN0IHYgPSB0aGlzLmFuYWx5c2VyRGF0YVtpXSAvIDEyOC4wO1xuLy8gICAgIGNvbnN0IHkgPSB2ICogY2FudmFzLmhlaWdodCAvIDI7XG4vL1xuLy8gICAgIGlmIChpID09PSAwKSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKHgsIHkpO1xuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubGluZVRvKHgsIHkpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgeCArPSBzbGljZVdpZHRoO1xuLy8gfVxuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVRvKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCAvIDIpO1xuLy8gY2FudmFzQ29udGV4dC5zdHJva2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9WaXN1YWxpemVyLnRzIiwiaW1wb3J0IE9yZ2FuIGZyb20gXCIuL09yZ2FuXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleWJvYXJkQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob3JnYW46IE9yZ2FuKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQubWV0YUtleSAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHBpdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yZ2FuLnBsYXkocGl0Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByYW5rID0gdGhpcy5rZXlUb1JhbmsoZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmsgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW4udG9nZ2xlUmFuayhyYW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICBpZiAocGl0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvcmdhbi5zdG9wKHBpdGNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1BpdGNoKGNvZGUpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBrZXlQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgICdLZXlRJywgLy8gRyNcbiAgICAgICAgICAgICdLZXlBJywgLy8gQVxuICAgICAgICAgICAgJ0tleVcnLCAvLyBBI1xuICAgICAgICAgICAgJ0tleVMnLCAvLyBCXG4gICAgICAgICAgICAvLyAnS2V5RScsXG4gICAgICAgICAgICAnS2V5RCcsIC8vIENcbiAgICAgICAgICAgICdLZXlSJywgLy8gQyNcbiAgICAgICAgICAgICdLZXlGJywgLy8gRFxuICAgICAgICAgICAgJ0tleVQnLCAvLyBEI1xuICAgICAgICAgICAgJ0tleUcnLCAvLyBFXG4gICAgICAgICAgICAvLyAnS2V5WScsXG4gICAgICAgICAgICAnS2V5SCcsIC8vIEZcbiAgICAgICAgICAgICdLZXlVJywgLy8gRiNcbiAgICAgICAgICAgICdLZXlKJywgLy8gR1xuICAgICAgICAgICAgJ0tleUknLCAvLyBHI1xuICAgICAgICAgICAgJ0tleUsnLCAvLyBBXG4gICAgICAgICAgICAnS2V5TycsIC8vIEEjXG4gICAgICAgICAgICAnS2V5TCcsIC8vIEJcbiAgICAgICAgICAgIC8vICdLZXlQJyxcbiAgICAgICAgICAgICdTZW1pY29sb24nLCAvLyBDXG4gICAgICAgICAgICAnQnJhY2tldExlZnQnLCAvLyBDI1xuICAgICAgICAgICAgJ1F1b3RlJywgLy8gRFxuICAgICAgICAgICAgJ0JyYWNrZXRSaWdodCcsIC8vIEQjXG4gICAgICAgICAgICAnRW50ZXInLCAvLyBFXG4gICAgICAgIF0uaW5kZXhPZihjb2RlKTtcbiAgICAgICAgaWYgKGtleVBvc2l0aW9uID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlQb3NpdGlvbiAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1JhbmsoY29kZSk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGtleVBvc2l0aW9uID0gW1xuICAgICAgICAgICAgJ0RpZ2l0MScsXG4gICAgICAgICAgICAnRGlnaXQyJyxcbiAgICAgICAgICAgICdEaWdpdDMnLFxuICAgICAgICAgICAgJ0RpZ2l0NCcsXG4gICAgICAgICAgICAnRGlnaXQ1JyxcbiAgICAgICAgICAgICdEaWdpdDYnLFxuICAgICAgICAgICAgJ0RpZ2l0NycsXG4gICAgICAgICAgICAnRGlnaXQ4JyxcbiAgICAgICAgICAgICdEaWdpdDknXG5cbiAgICAgICAgXS5pbmRleE9mKGNvZGUpO1xuICAgICAgICBpZiAoa2V5UG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleVBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvS2V5Ym9hcmRDb250cm9sbGVyLnRzIiwiaW1wb3J0IHsgcGl0Y2hUb0ZyZXF1ZW5jeSwgY2xhbXAgfSBmcm9tICcuL3V0aWwnO1xuXG4vLyBUT0RPOiBEb24ndCBoYXZlIHNvIG1hbnkgb3NjaWxsYXRvcnMgYWxsIHRoZSB0aW1lLiBBbmQgZmlndXJlIG91dCBvdGhlciB3YXlzIHRvIHJlZHVjZSBjb21wdXRhdGlvbi5cblxuLyoqXG4gKiBBbiBvcmdhbiBpcyBhIGNvbGxlY3Rpb24gb2YgcmFua3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZ2FuIHtcbiAgICBwcml2YXRlIHJhbmtzOiBBcnJheTxSYW5rPjtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBhY3RpdmVSYW5rczogQXJyYXk8UmFuaz47XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgY29uc3QgZ2FpbiA9IHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IDAuMTtcblxuICAgICAgICBjb25zdCB0cmVtdWxhdG9yT3NjaWxsYXRvciA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5mcmVxdWVuY3kudmFsdWUgPSAzLjA7XG4gICAgICAgIHRyZW11bGF0b3JPc2NpbGxhdG9yLnN0YXJ0KCk7XG4gICAgICAgIGNvbnN0IHRyZW11bGF0b3JTdHJlbmd0aCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5jb25uZWN0KHRyZW11bGF0b3JTdHJlbmd0aCk7XG4gICAgICAgIHRyZW11bGF0b3JTdHJlbmd0aC5nYWluLnZhbHVlID0gMC4yO1xuXG4gICAgICAgIHRoaXMuYWN0aXZlUmFua3MgPSBbXTtcbiAgICAgICAgdGhpcy5yYW5rcyA9IFtdO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMzYsIDIuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMjQsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMTIsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAwLCAxLjApKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMTIsIDAuNykpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAyNCwgMC41KSk7XG4gICAgICAgIC8vIHRoaXMucmFua3MucHVzaChuZXcgUmFuayhjb250ZXh0LCB0cmVtdWxhdG9yU3RyZW5ndGgsIDM2KSk7XG4gICAgICAgIHRoaXMucmFua3MuZm9yRWFjaCgocmFuaykgPT4gcmFuay5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCkpXG4gICAgfVxuXG4gICAgcHVibGljIGlzUmFua0FjdGl2ZShyYW5rSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLnZhbGlkYXRlUmFuayhyYW5rSW5kZXgpO1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHRoaXMucmFua3NbcmFua0luZGV4XSkgPj0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlUmFuayhyYW5rSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuaXNSYW5rQWN0aXZlKHJhbmtJbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0aXZhdGVSYW5rKHJhbmtJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSB0aGlzLnJhbmtzW3JhbmtJbmRleF07XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVJhbmtzLmluZGV4T2YocmFuaykgPT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUmFua3MucHVzaChyYW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBY3RpdmF0ZSByYW5rICR7cmFua0luZGV4fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFjdGl2YXRlUmFua3MoLi4ucmFua0luZGV4ZXM6IEFycmF5PG51bWJlcj4pIHtcbiAgICAgICAgcmFua0luZGV4ZXMuZm9yRWFjaCgocmFua0luZGV4KSA9PiB0aGlzLmFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmtzKC4uLnJhbmtJbmRleGVzOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIHJhbmtJbmRleGVzLmZvckVhY2goKHJhbmtJbmRleCkgPT4gdGhpcy5kZWFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgY29uc3QgcmFuayA9IHRoaXMucmFua3NbcmFua0luZGV4XTtcbiAgICAgICAgY29uc3QgYWN0aXZlUmFua0luZGV4ID0gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHJhbmspO1xuICAgICAgICBpZiAoYWN0aXZlUmFua0luZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLnNwbGljZShhY3RpdmVSYW5rSW5kZXgsIDEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlYWN0aXZhdGUgcmFuayAke3JhbmtJbmRleH1gKTtcbiAgICAgICAgICAgIHJhbmsuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJhbmtJbmRleCA8IDAgfHwgcmFua0luZGV4ID49IHRoaXMucmFua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW52YWxpZCBSYW5rOiAke3JhbmtJbmRleH1gKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLmZvckVhY2goKHJhbmspID0+IHtcbiAgICAgICAgICAgIHJhbmsucGxheShwaXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKHBpdGNoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmVSYW5rcy5mb3JFYWNoKChyYW5rKSA9PiB7XG4gICAgICAgICAgICByYW5rLnN0b3AocGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSByYW5rIGlzIGEgc2V0IG9mIHBpcGVzLlxuICovXG5jbGFzcyBSYW5rIHtcbiAgICBwcml2YXRlIHBpcGVzOiB7IFtwaXRjaDogbnVtYmVyXTogUGlwZSB9O1xuICAgIHB1YmxpYyBvdXRwdXQ6IEF1ZGlvTm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCwgdHJlbXVsYXRvcjogQXVkaW9Ob2RlLCBvZmZzZXQ6IG51bWJlciwgZ2FpbkFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gZ2FpbkFtb3VudDtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBnYWluO1xuXG4gICAgICAgIHRoaXMucGlwZXMgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IC0xOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGlwZSA9IG5ldyBQaXBlKGNvbnRleHQsIGkgKyBvZmZzZXQsIHRyZW11bGF0b3IpO1xuICAgICAgICAgICAgcGlwZS5vdXRwdXQuY29ubmVjdChnYWluKTtcbiAgICAgICAgICAgIHRoaXMucGlwZXNbaV0gPSBwaXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5wbGF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5zdG9wKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BBbGwoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgcGl0Y2ggaW4gdGhpcy5waXBlcykge1xuICAgICAgICAgICAgdGhpcy5waXBlc1twaXRjaF0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBQaXBlIHtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBnYWluOiBHYWluTm9kZTtcbiAgICBwcml2YXRlIHBpdGNoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwbGF5aW5nOiBib29sZWFuO1xuICAgIHByaXZhdGUgbWF4R2FpbjogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoY29udGV4dDogQXVkaW9Db250ZXh0LCBwaXRjaDogbnVtYmVyLCB0cmVtdWxhdG9yOiBBdWRpb05vZGUpIHtcbiAgICAgICAgdGhpcy5waXRjaCA9IHBpdGNoO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tYXhHYWluID0gMC4xO1xuXG4gICAgICAgIHRoaXMuZ2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpOyAvLyBNYWluIHZvbHVtZSBjb250cm9sXG4gICAgICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLmdhaW47XG5cblxuICAgICAgICAvLyBDcmVhdGVzIHRoZSBzb3VuZFxuICAgICAgICBjb25zdCBvc2NpbGxhdG9yID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIG9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gcGl0Y2hUb0ZyZXF1ZW5jeShwaXRjaCk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQpKTtcblxuICAgICAgICAvLyBUcmVtZWxvXG4gICAgICAgIGNvbnN0IHRyZW1lbG8gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgY29uc3QgdHJlbWVsb1N0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRyZW1lbG9TdHJlbmd0aC5nYWluLnZhbHVlID0gMS4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodHJlbWVsb1N0cmVuZ3RoKTtcbiAgICAgICAgdHJlbWVsb1N0cmVuZ3RoLmNvbm5lY3QodHJlbWVsby5nYWluKTtcblxuICAgICAgICAvLyBWaWJyYXRvXG4gICAgICAgIGNvbnN0IHZpYnJhdG9QaXRjaFN0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZpYnJhdG9QaXRjaFN0cmVuZ3RoLmdhaW4udmFsdWUgPSAxMC4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodmlicmF0b1BpdGNoU3RyZW5ndGgpO1xuICAgICAgICAvLyB2aWJyYXRvUGl0Y2hTdHJlbmd0aC5jb25uZWN0KG9zY2lsbGF0b3IuZGV0dW5lKTsgLy8gY2F1c2VzIHN0dXR0ZXJpbmcgZm9yIHNvbWUgcmVhc29uXG5cbiAgICAgICAgLy8gTGVmdC9SaWdodCBwYW5cbiAgICAgICAgY29uc3QgcGFubmVyID0gY29udGV4dC5jcmVhdGVTdGVyZW9QYW5uZXIoKTtcbiAgICAgICAgcGFubmVyLnBhbi52YWx1ZSA9IGNsYW1wKHRoaXMucGl0Y2ggLyA0OCwgLTEuMCwgMS4wKTtcblxuICAgICAgICBvc2NpbGxhdG9yLmNvbm5lY3QodHJlbWVsbyk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc3RhcnQoKTtcbiAgICAgICAgdHJlbWVsby5jb25uZWN0KHBhbm5lcik7XG4gICAgICAgIHBhbm5lci5jb25uZWN0KHRoaXMuZ2Fpbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IHRoZSBzcGVjdHJ1bSBmb3IgdGhlIHBpcGUuXG4gICAgICogQHBhcmFtIGNvbnRleHRcbiAgICAgKiBAcmV0dXJuIHtQZXJpb2RpY1dhdmV9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRQZXJpb2RpY1dhdmUoY29udGV4dDogQXVkaW9Db250ZXh0KSB7XG4gICAgICAgIGNvbnN0IE5VTUJFUl9PRl9IQVJNT05JQ1MgPSAxNjtcbiAgICAgICAgY29uc3QgRVZFTl9DT0VGRklDSUVOVCA9IDAuMztcbiAgICAgICAgY29uc3QgREVDQVkgPSAzLjU7XG5cbiAgICAgICAgY29uc3QgcmVhbCA9IG5ldyBGbG9hdDMyQXJyYXkoTlVNQkVSX09GX0hBUk1PTklDUyk7XG4gICAgICAgIGNvbnN0IGltYWcgPSBuZXcgRmxvYXQzMkFycmF5KE5VTUJFUl9PRl9IQVJNT05JQ1MpO1xuICAgICAgICByZWFsWzBdID0gMDtcbiAgICAgICAgaW1hZ1swXSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgTlVNQkVSX09GX0hBUk1PTklDUzsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT0gMSkge1xuICAgICAgICAgICAgICAgIHJlYWxbaV0gPSAxLjAgLyAoaSAqKiBERUNBWSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlYWxbaV0gPSBFVkVOX0NPRUZGSUNJRU5UIC8gKGkgKiogREVDQVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ1tpXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogQ2hpZmZcblxuICAgICAgICByZXR1cm4gY29udGV4dC5jcmVhdGVQZXJpb2RpY1dhdmUocmVhbCwgaW1hZywge2Rpc2FibGVOb3JtYWxpemF0aW9uOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aW1lIHRvIHdhcm0gdXBcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEF0dGFja0xlbmd0aChjdXJyZW50R2FpbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IGNsYW1wKCh0aGlzLnBpdGNoICsgMzYpIC8gNzIsIDAsIDEuMCkgKiogMS41OyAvLyBbMC4wLCAxLjBdXG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IDAuMiAvICgxLjAgKyAxOSAqIHBlcmNlbnQpOyAvLyBbMC4wMSwgMC4yXVxuICAgICAgICByZXR1cm4gKDEuMCAtIGN1cnJlbnRHYWluIC8gdGhpcy5tYXhHYWluKSAqIG1heExlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRpbWUgdG8gY29vbCBkb3duXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREZWNheUxlbmd0aChjdXJyZW50R2FpbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IGNsYW1wKCh0aGlzLnBpdGNoICsgMzYpIC8gNzIsIDAsIDEuMCkgKiogMS41OyAvLyBbMC4wLCAxLjBdXG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IDAuNSAvICgxLjAgKyAxOSAqIHBlcmNlbnQpOyAvLyBbMC4wMjUsIDAuNV1cbiAgICAgICAgcmV0dXJuIChjdXJyZW50R2FpbiAvIHRoaXMubWF4R2FpbikgKiBtYXhMZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkoKSB7XG4gICAgICAgIGlmICghdGhpcy5wbGF5aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BpcGUgcGxheWVkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHRoaXMub3V0cHV0LmNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50R2FpbiA9IHRoaXMuZ2Fpbi5nYWluLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2Fpbiwgbm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMubWF4R2Fpbiwgbm93ICsgdGhpcy5nZXRBdHRhY2tMZW5ndGgoY3VycmVudEdhaW4pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy5wbGF5aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwaXBlIHN0b3BwZWQnKTtcblxuICAgICAgICAgICAgY29uc3Qgbm93ID0gdGhpcy5vdXRwdXQuY29udGV4dC5jdXJyZW50VGltZTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRHYWluID0gdGhpcy5nYWluLmdhaW4udmFsdWU7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMobm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRHYWluLCBub3cpO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgbm93ICsgdGhpcy5nZXREZWNheUxlbmd0aChjdXJyZW50R2FpbikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL09yZ2FuLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==