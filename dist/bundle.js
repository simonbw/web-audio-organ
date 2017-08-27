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
    wet.gain.value = 1.0;
    var dry = context.createGain();
    dry.gain.value = 0.0;
    organ.output.connect(reverb);
    organ.output.connect(dry);
    reverb.connect(wet);
    wet.connect(dynamics);
    dry.connect(dynamics);
    dynamics.connect(visualizer.input);
    dynamics.connect(context.destination);
    util_1.loadSound(context, 'stalbans_a_ortf.wav')
        .then(function (audioBuffer) {
        reverb.buffer = audioBuffer;
    })["catch"](function (error) { return console.error(error); });
    new KeyboardController_1["default"](organ);
    // for debugging
    window['organ'] = organ;
    window['context'] = context;
    document.addEventListener('keydown', function (event) {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.code == 'KeyZ') {
                wet.gain.setTargetAtTime(0, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(1.0, context.currentTime, 0.01);
            }
            else if (event.code == 'KeyX') {
                wet.gain.setTargetAtTime(0.5, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(0.5, context.currentTime, 0.01);
            }
            else if (event.code == 'KeyC') {
                wet.gain.setTargetAtTime(1.0, context.currentTime, 0.01);
                dry.gain.setTargetAtTime(0.0, context.currentTime, 0.01);
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
        // vibratoPitchStrength.connect(oscillator.detune); // causes stuttering for some reason
        oscillator.connect(tremelo);
        oscillator.start();
        // tremelo.connect(this.highpass); // causes stuttering for some reason
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTMxZTBmYWYyN2RjZDAyMDc3OWMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9WaXN1YWxpemVyLnRzIiwid2VicGFjazovLy8uL3NyYy9LZXlib2FyZENvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL09yZ2FuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQTs7OztHQUlHO0FBQ0gsMEJBQWlDLEtBQWE7SUFDMUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUZELDRDQUVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxtQkFBMEIsR0FBVyxFQUFFLEdBQVc7SUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCw4QkFFQztBQUVEOzs7Ozs7R0FNRztBQUNI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QUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztJQUNMLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FBQyIsImZpbGUiOiJkaXN0L2J1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGUzMWUwZmFmMjdkY2QwMjA3NzljIiwiLyoqXG4gKiBDb252ZXJ0cyBhIHBpdGNoIGdpdmUgaW4gc2VtaXRvbmVzIGFib3ZlIEE0IHRvIGEgZnJlcXVlbmN5IGluIEh6LlxuICogQHBhcmFtIHBpdGNoXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaXRjaFRvRnJlcXVlbmN5KHBpdGNoOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiA0NDAgKiBNYXRoLnBvdygyLCBwaXRjaCAvIDEyLjApO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgcmFuZG9tIGludGVnZXIgaW4gdGhlIHJhbmdlIFttaW4sIG1heClcbiAqIEBwYXJhbSBtaW5cbiAqIEBwYXJhbSBtYXhcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUludChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG59XG5cbi8qKlxuICogQ2xhbXAgdmFsdWUgdG8gdGhlIHJhbmdlIFttaW4sIG1heF1cbiAqIEBwYXJhbSB2YWx1ZVxuICogQHBhcmFtIG1pblxuICogQHBhcmFtIG1heFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAodmFsdWU6IG51bWJlciwgbWluOiBudW1iZXIgPSAtMS4wLCBtYXg6IG51bWJlciA9IDEuMCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKHZhbHVlLCBtYXgpLCBtaW4pO1xufVxuXG4vKipcbiAqIExvYWRzIGEgc291bmQgZnJvbSBhIGZpbGVuYW1lLlxuICogQHBhcmFtIGNvbnRleHRcbiAqIEBwYXJhbSBmaWxlbmFtZVxuICogQHJldHVybiB7UHJvbWlzZTxSZXNwb25zZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU291bmQoY29udGV4dDogQXVkaW9Db250ZXh0LCBmaWxlbmFtZTogc3RyaW5nKTogUHJvbWlzZTxBdWRpb0J1ZmZlcj4ge1xuICAgIHJldHVybiBmZXRjaChgc291bmRzLyR7ZmlsZW5hbWV9YClcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSlcbiAgICAgICAgLnRoZW4oKGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlcikgPT4gY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYXJyYXlCdWZmZXIpKTtcbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbC50cyIsImltcG9ydCB7IGxvYWRTb3VuZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBWaXN1YWxpemVyIH0gZnJvbSAnLi9WaXN1YWxpemVyJztcbmltcG9ydCBLZXlib2FyZENvbnRyb2xsZXIgZnJvbSBcIi4vS2V5Ym9hcmRDb250cm9sbGVyXCI7XG5pbXBvcnQgT3JnYW4gZnJvbSBcIi4vT3JnYW5cIjtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgY29uc3QgY29udGV4dDogQXVkaW9Db250ZXh0ID0gbmV3IChBdWRpb0NvbnRleHQpKCk7XG4gICAgY29uc3Qgb3JnYW4gPSBuZXcgT3JnYW4oY29udGV4dCk7XG4gICAgb3JnYW4uYWN0aXZhdGVSYW5rcygwLCAxLCAyLCAzLCA0LCA1KTtcbiAgICBjb25zdCByZXZlcmIgPSBjb250ZXh0LmNyZWF0ZUNvbnZvbHZlcigpO1xuXG4gICAgLy8gTGltaXQgdGhlIHZvbHVtZVxuICAgIGNvbnN0IGR5bmFtaWNzID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcbiAgICBkeW5hbWljcy50aHJlc2hvbGQudmFsdWUgPSAtMjA7XG4gICAgZHluYW1pY3MucmF0aW8udmFsdWUgPSAxMDtcblxuICAgIGNvbnN0IHZpc3VhbGl6ZXIgPSBuZXcgVmlzdWFsaXplcihjb250ZXh0KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZpc3VhbGl6ZXIuZWxlbWVudCk7XG5cbiAgICBjb25zdCB3ZXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB3ZXQuZ2Fpbi52YWx1ZSA9IDEuMDtcbiAgICBjb25zdCBkcnkgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBkcnkuZ2Fpbi52YWx1ZSA9IDAuMDtcblxuICAgIG9yZ2FuLm91dHB1dC5jb25uZWN0KHJldmVyYik7XG4gICAgb3JnYW4ub3V0cHV0LmNvbm5lY3QoZHJ5KTtcbiAgICByZXZlcmIuY29ubmVjdCh3ZXQpO1xuICAgIHdldC5jb25uZWN0KGR5bmFtaWNzKTtcbiAgICBkcnkuY29ubmVjdChkeW5hbWljcyk7XG4gICAgZHluYW1pY3MuY29ubmVjdCh2aXN1YWxpemVyLmlucHV0KTtcbiAgICBkeW5hbWljcy5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgbG9hZFNvdW5kKGNvbnRleHQsICdzdGFsYmFuc19hX29ydGYud2F2JylcbiAgICAgICAgLnRoZW4oYXVkaW9CdWZmZXIgPT4ge1xuICAgICAgICAgICAgcmV2ZXJiLmJ1ZmZlciA9IGF1ZGlvQnVmZmVyO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcblxuICAgIG5ldyBLZXlib2FyZENvbnRyb2xsZXIob3JnYW4pO1xuXG4gICAgLy8gZm9yIGRlYnVnZ2luZ1xuICAgIHdpbmRvd1snb3JnYW4nXSA9IG9yZ2FuO1xuICAgIHdpbmRvd1snY29udGV4dCddID0gY29udGV4dDtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5jdHJsS2V5ICYmICFldmVudC5tZXRhS2V5ICYmICFldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlID09ICdLZXlaJykge1xuICAgICAgICAgICAgICAgIHdldC5nYWluLnNldFRhcmdldEF0VGltZSgwLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgICAgICBkcnkuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMS4wLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5WCcpIHtcbiAgICAgICAgICAgICAgICB3ZXQuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMC41LCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgICAgICBkcnkuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMC41LCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5QycpIHtcbiAgICAgICAgICAgICAgICB3ZXQuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMS4wLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgICAgICBkcnkuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMC4wLCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXgudHMiLCJleHBvcnQgY2xhc3MgVmlzdWFsaXplciB7XG4gICAgcHVibGljIGlucHV0OiBBdWRpb05vZGU7XG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhbmFseXNlcjogQW5hbHlzZXJOb2RlO1xuICAgIHByaXZhdGUgYW5hbHlzZXJEYXRhOiBVaW50OEFycmF5O1xuICAgIHByaXZhdGUgYmFyczogQXJyYXk8SFRNTEVsZW1lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgdGhpcy5hbmFseXNlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICAgICAgICB0aGlzLmFuYWx5c2VyLmZmdFNpemUgPSAyMDQ4O1xuICAgICAgICB0aGlzLmFuYWx5c2VyRGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpO1xuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5hbmFseXNlcjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnVmlzdWFsaXplcicpO1xuXG4gICAgICAgIHRoaXMuYmFycyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI0OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYmFyLmNsYXNzTGlzdC5hZGQoJ1Zpc3VhbGl6ZXItYmFyJyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoYmFyKTtcbiAgICAgICAgICAgIHRoaXMuYmFycy5wdXNoKGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdygpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZHJhdygpKTtcblxuICAgICAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKHRoaXMuYW5hbHlzZXJEYXRhKTtcblxuICAgICAgICB0aGlzLmJhcnMuZm9yRWFjaCgoYmFyLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0QmFyVmFsdWUoaSk7XG4gICAgICAgICAgICBiYXIuc3R5bGUuaGVpZ2h0ID0gYCR7dmFsdWUgKiAxMDB9JWA7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAwLjk1KSB7XG4gICAgICAgICAgICAgICAgYmFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGAjRjAwYDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPiAwLjgpIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRjBgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRkZgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QmFyVmFsdWUoaTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZGF0YVBlckJhciA9IHRoaXMuYW5hbHlzZXJEYXRhLmxlbmd0aCAvIHRoaXMuYmFycy5sZW5ndGg7XG4gICAgICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5mbG9vcigoaSAqIGRhdGFQZXJCYXIpKTtcbiAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBNYXRoLmZsb29yKGRhdGFQZXJCYXIpO1xuICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBlbmQ7IGorKykge1xuICAgICAgICAgICAgdmFsdWUgPSBNYXRoLm1heCh0aGlzLmFuYWx5c2VyRGF0YVtqXSAvIDI1NiwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cblxuLy8gY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLmVsZW1lbnQ7XG4vLyBjb25zdCBjYW52YXNDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbi8vXG4vLyBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoMjAwLCAyMDAsIDIwMCknO1xuLy8gY2FudmFzQ29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVdpZHRoID0gMjtcbi8vIGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSAncmdiKDAsIDAsIDApJztcbi8vXG4vLyBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuLy8gY29uc3Qgc2xpY2VXaWR0aCA9IGNhbnZhcy53aWR0aCAvIHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQ7XG4vL1xuLy8gZm9yIChsZXQgaSA9IDAsIHggPSAwOyBpIDwgdGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDsgaSsrKSB7XG4vL1xuLy8gICAgIGNvbnN0IHYgPSB0aGlzLmFuYWx5c2VyRGF0YVtpXSAvIDEyOC4wO1xuLy8gICAgIGNvbnN0IHkgPSB2ICogY2FudmFzLmhlaWdodCAvIDI7XG4vL1xuLy8gICAgIGlmIChpID09PSAwKSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKHgsIHkpO1xuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubGluZVRvKHgsIHkpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgeCArPSBzbGljZVdpZHRoO1xuLy8gfVxuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVRvKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCAvIDIpO1xuLy8gY2FudmFzQ29udGV4dC5zdHJva2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9WaXN1YWxpemVyLnRzIiwiaW1wb3J0IE9yZ2FuIGZyb20gXCIuL09yZ2FuXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleWJvYXJkQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob3JnYW46IE9yZ2FuKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQubWV0YUtleSAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHBpdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yZ2FuLnBsYXkocGl0Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByYW5rID0gdGhpcy5rZXlUb1JhbmsoZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmsgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW4udG9nZ2xlUmFuayhyYW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICBpZiAocGl0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvcmdhbi5zdG9wKHBpdGNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1BpdGNoKGNvZGUpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBrZXlQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgICdLZXlRJywgLy8gRyNcbiAgICAgICAgICAgICdLZXlBJywgLy8gQVxuICAgICAgICAgICAgJ0tleVcnLCAvLyBBI1xuICAgICAgICAgICAgJ0tleVMnLCAvLyBCXG4gICAgICAgICAgICAvLyAnS2V5RScsXG4gICAgICAgICAgICAnS2V5RCcsIC8vIENcbiAgICAgICAgICAgICdLZXlSJywgLy8gQyNcbiAgICAgICAgICAgICdLZXlGJywgLy8gRFxuICAgICAgICAgICAgJ0tleVQnLCAvLyBEI1xuICAgICAgICAgICAgJ0tleUcnLCAvLyBFXG4gICAgICAgICAgICAvLyAnS2V5WScsXG4gICAgICAgICAgICAnS2V5SCcsIC8vIEZcbiAgICAgICAgICAgICdLZXlVJywgLy8gRiNcbiAgICAgICAgICAgICdLZXlKJywgLy8gR1xuICAgICAgICAgICAgJ0tleUknLCAvLyBHI1xuICAgICAgICAgICAgJ0tleUsnLCAvLyBBXG4gICAgICAgICAgICAnS2V5TycsIC8vIEEjXG4gICAgICAgICAgICAnS2V5TCcsIC8vIEJcbiAgICAgICAgICAgIC8vICdLZXlQJyxcbiAgICAgICAgICAgICdTZW1pY29sb24nLCAvLyBDXG4gICAgICAgICAgICAnQnJhY2tldExlZnQnLCAvLyBDI1xuICAgICAgICAgICAgJ1F1b3RlJywgLy8gRFxuICAgICAgICAgICAgJ0JyYWNrZXRSaWdodCcsIC8vIEQjXG4gICAgICAgICAgICAnRW50ZXInLCAvLyBFXG4gICAgICAgIF0uaW5kZXhPZihjb2RlKTtcbiAgICAgICAgaWYgKGtleVBvc2l0aW9uID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlQb3NpdGlvbiAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1JhbmsoY29kZSk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGtleVBvc2l0aW9uID0gW1xuICAgICAgICAgICAgJ0RpZ2l0MScsXG4gICAgICAgICAgICAnRGlnaXQyJyxcbiAgICAgICAgICAgICdEaWdpdDMnLFxuICAgICAgICAgICAgJ0RpZ2l0NCcsXG4gICAgICAgICAgICAnRGlnaXQ1JyxcbiAgICAgICAgICAgICdEaWdpdDYnLFxuICAgICAgICAgICAgJ0RpZ2l0NycsXG4gICAgICAgICAgICAnRGlnaXQ4JyxcbiAgICAgICAgICAgICdEaWdpdDknXG5cbiAgICAgICAgXS5pbmRleE9mKGNvZGUpO1xuICAgICAgICBpZiAoa2V5UG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleVBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvS2V5Ym9hcmRDb250cm9sbGVyLnRzIiwiaW1wb3J0IHsgcGl0Y2hUb0ZyZXF1ZW5jeSwgY2xhbXAgfSBmcm9tICcuL3V0aWwnO1xuXG4vLyBUT0RPOiBEb24ndCBoYXZlIHNvIG1hbnkgb3NjaWxsYXRvcnMgYWxsIHRoZSB0aW1lLiBBbmQgZmlndXJlIG91dCBvdGhlciB3YXlzIHRvIHJlZHVjZSBjb21wdXRhdGlvbi5cblxuLyoqXG4gKiBBbiBvcmdhbiBpcyBhIGNvbGxlY3Rpb24gb2YgcmFua3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZ2FuIHtcbiAgICBwcml2YXRlIHJhbmtzOiBBcnJheTxSYW5rPjtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBhY3RpdmVSYW5rczogQXJyYXk8UmFuaz47XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgY29uc3QgZ2FpbiA9IHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IDAuMTtcblxuICAgICAgICBjb25zdCB0cmVtdWxhdG9yT3NjaWxsYXRvciA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5mcmVxdWVuY3kudmFsdWUgPSAzLjA7XG4gICAgICAgIHRyZW11bGF0b3JPc2NpbGxhdG9yLnN0YXJ0KCk7XG4gICAgICAgIGNvbnN0IHRyZW11bGF0b3JTdHJlbmd0aCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5jb25uZWN0KHRyZW11bGF0b3JTdHJlbmd0aCk7XG4gICAgICAgIHRyZW11bGF0b3JTdHJlbmd0aC5nYWluLnZhbHVlID0gMC4yO1xuXG4gICAgICAgIHRoaXMuYWN0aXZlUmFua3MgPSBbXTtcbiAgICAgICAgdGhpcy5yYW5rcyA9IFtdO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMzYsIDIuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMjQsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMTIsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAwLCAxLjApKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMTIsIDAuNykpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAyNCwgMC41KSk7XG4gICAgICAgIC8vIHRoaXMucmFua3MucHVzaChuZXcgUmFuayhjb250ZXh0LCB0cmVtdWxhdG9yU3RyZW5ndGgsIDM2KSk7XG4gICAgICAgIHRoaXMucmFua3MuZm9yRWFjaCgocmFuaykgPT4gcmFuay5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCkpXG4gICAgfVxuXG4gICAgcHVibGljIGlzUmFua0FjdGl2ZShyYW5rSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLnZhbGlkYXRlUmFuayhyYW5rSW5kZXgpO1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHRoaXMucmFua3NbcmFua0luZGV4XSkgPj0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlUmFuayhyYW5rSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuaXNSYW5rQWN0aXZlKHJhbmtJbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0aXZhdGVSYW5rKHJhbmtJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSB0aGlzLnJhbmtzW3JhbmtJbmRleF07XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVJhbmtzLmluZGV4T2YocmFuaykgPT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUmFua3MucHVzaChyYW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBY3RpdmF0ZSByYW5rICR7cmFua0luZGV4fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFjdGl2YXRlUmFua3MoLi4ucmFua0luZGV4ZXM6IEFycmF5PG51bWJlcj4pIHtcbiAgICAgICAgcmFua0luZGV4ZXMuZm9yRWFjaCgocmFua0luZGV4KSA9PiB0aGlzLmFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmtzKC4uLnJhbmtJbmRleGVzOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIHJhbmtJbmRleGVzLmZvckVhY2goKHJhbmtJbmRleCkgPT4gdGhpcy5kZWFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgY29uc3QgcmFuayA9IHRoaXMucmFua3NbcmFua0luZGV4XTtcbiAgICAgICAgY29uc3QgYWN0aXZlUmFua0luZGV4ID0gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHJhbmspO1xuICAgICAgICBpZiAoYWN0aXZlUmFua0luZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLnNwbGljZShhY3RpdmVSYW5rSW5kZXgsIDEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlYWN0aXZhdGUgcmFuayAke3JhbmtJbmRleH1gKTtcbiAgICAgICAgICAgIHJhbmsuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJhbmtJbmRleCA8IDAgfHwgcmFua0luZGV4ID49IHRoaXMucmFua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW52YWxpZCBSYW5rOiAke3JhbmtJbmRleH1gKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLmZvckVhY2goKHJhbmspID0+IHtcbiAgICAgICAgICAgIHJhbmsucGxheShwaXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKHBpdGNoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmVSYW5rcy5mb3JFYWNoKChyYW5rKSA9PiB7XG4gICAgICAgICAgICByYW5rLnN0b3AocGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSByYW5rIGlzIGEgc2V0IG9mIHBpcGVzLlxuICovXG5jbGFzcyBSYW5rIHtcbiAgICBwcml2YXRlIHBpcGVzOiB7IFtwaXRjaDogbnVtYmVyXTogUGlwZSB9O1xuICAgIHB1YmxpYyBvdXRwdXQ6IEF1ZGlvTm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCwgdHJlbXVsYXRvcjogQXVkaW9Ob2RlLCBvZmZzZXQ6IG51bWJlciwgZ2FpbkFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gZ2FpbkFtb3VudDtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBnYWluO1xuXG4gICAgICAgIHRoaXMucGlwZXMgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IC0xOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGlwZSA9IG5ldyBQaXBlKGNvbnRleHQsIGkgKyBvZmZzZXQsIHRyZW11bGF0b3IpO1xuICAgICAgICAgICAgcGlwZS5vdXRwdXQuY29ubmVjdChnYWluKTtcbiAgICAgICAgICAgIHRoaXMucGlwZXNbaV0gPSBwaXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5wbGF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5zdG9wKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BBbGwoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgcGl0Y2ggaW4gdGhpcy5waXBlcykge1xuICAgICAgICAgICAgdGhpcy5waXBlc1twaXRjaF0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBQaXBlIHtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBnYWluOiBHYWluTm9kZTtcbiAgICBwcml2YXRlIHBpdGNoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoaWdocGFzczogQmlxdWFkRmlsdGVyTm9kZTtcbiAgICBwcml2YXRlIHBsYXlpbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBtYXhHYWluOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQsIHBpdGNoOiBudW1iZXIsIHRyZW11bGF0b3I6IEF1ZGlvTm9kZSkge1xuICAgICAgICB0aGlzLnBpdGNoID0gcGl0Y2g7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1heEdhaW4gPSAwLjE7XG5cbiAgICAgICAgdGhpcy5nYWluID0gY29udGV4dC5jcmVhdGVHYWluKCk7IC8vIE1haW4gdm9sdW1lIGNvbnRyb2xcbiAgICAgICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMuZ2FpbjtcblxuICAgICAgICB0aGlzLmhpZ2hwYXNzID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcblxuICAgICAgICAvLyBDcmVhdGVzIHRoZSBzb3VuZFxuICAgICAgICBjb25zdCBvc2NpbGxhdG9yID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIG9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gcGl0Y2hUb0ZyZXF1ZW5jeShwaXRjaCk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQpKTtcblxuICAgICAgICAvLyBUcmVtZWxvXG4gICAgICAgIGNvbnN0IHRyZW1lbG8gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgY29uc3QgdHJlbWVsb1N0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRyZW1lbG9TdHJlbmd0aC5nYWluLnZhbHVlID0gMS4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodHJlbWVsb1N0cmVuZ3RoKTtcbiAgICAgICAgdHJlbWVsb1N0cmVuZ3RoLmNvbm5lY3QodHJlbWVsby5nYWluKTtcblxuICAgICAgICAvLyBWaWJyYXRvXG4gICAgICAgIGNvbnN0IHZpYnJhdG9QaXRjaFN0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZpYnJhdG9QaXRjaFN0cmVuZ3RoLmdhaW4udmFsdWUgPSAxMC4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodmlicmF0b1BpdGNoU3RyZW5ndGgpO1xuICAgICAgICAvLyB2aWJyYXRvUGl0Y2hTdHJlbmd0aC5jb25uZWN0KG9zY2lsbGF0b3IuZGV0dW5lKTsgLy8gY2F1c2VzIHN0dXR0ZXJpbmcgZm9yIHNvbWUgcmVhc29uXG5cbiAgICAgICAgb3NjaWxsYXRvci5jb25uZWN0KHRyZW1lbG8pO1xuICAgICAgICBvc2NpbGxhdG9yLnN0YXJ0KCk7XG5cbiAgICAgICAgLy8gdHJlbWVsby5jb25uZWN0KHRoaXMuaGlnaHBhc3MpOyAvLyBjYXVzZXMgc3R1dHRlcmluZyBmb3Igc29tZSByZWFzb25cbiAgICAgICAgLy8gdGhpcy5oaWdocGFzcy5jb25uZWN0KHRoaXMuZ2Fpbik7XG4gICAgICAgIHRyZW1lbG8uY29ubmVjdCh0aGlzLmdhaW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCB0aGUgc3BlY3RydW0gZm9yIHRoZSBwaXBlLlxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHJldHVybiB7UGVyaW9kaWNXYXZlfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xuICAgICAgICBjb25zdCBOVU1CRVJfT0ZfSEFSTU9OSUNTID0gMTY7XG4gICAgICAgIGNvbnN0IEVWRU5fQ09FRkZJQ0lFTlQgPSAwLjM7XG4gICAgICAgIGNvbnN0IERFQ0FZID0gMy41O1xuXG4gICAgICAgIGNvbnN0IHJlYWwgPSBuZXcgRmxvYXQzMkFycmF5KE5VTUJFUl9PRl9IQVJNT05JQ1MpO1xuICAgICAgICBjb25zdCBpbWFnID0gbmV3IEZsb2F0MzJBcnJheShOVU1CRVJfT0ZfSEFSTU9OSUNTKTtcbiAgICAgICAgcmVhbFswXSA9IDA7XG4gICAgICAgIGltYWdbMF0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IE5VTUJFUl9PRl9IQVJNT05JQ1M7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgJSAyID09IDEpIHtcbiAgICAgICAgICAgICAgICByZWFsW2ldID0gMS4wIC8gKGkgKiogREVDQVkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWFsW2ldID0gRVZFTl9DT0VGRklDSUVOVCAvIChpICoqIERFQ0FZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltYWdbaV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IENoaWZmXG5cbiAgICAgICAgcmV0dXJuIGNvbnRleHQuY3JlYXRlUGVyaW9kaWNXYXZlKHJlYWwsIGltYWcsIHtkaXNhYmxlTm9ybWFsaXphdGlvbjogdHJ1ZX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGltZSB0byB3YXJtIHVwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRBdHRhY2tMZW5ndGgoY3VycmVudEdhaW46IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBjbGFtcCgodGhpcy5waXRjaCArIDM2KSAvIDcyLCAwLCAxLjApICoqIDEuNTsgLy8gWzAuMCwgMS4wXVxuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSAwLjIgLyAoMS4wICsgMTkgKiBwZXJjZW50KTsgLy8gWzAuMDEsIDAuMl1cbiAgICAgICAgcmV0dXJuICgxLjAgLSBjdXJyZW50R2FpbiAvIHRoaXMubWF4R2FpbikgKiBtYXhMZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aW1lIHRvIGNvb2wgZG93blxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGVjYXlMZW5ndGgoY3VycmVudEdhaW46IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBjbGFtcCgodGhpcy5waXRjaCArIDM2KSAvIDcyLCAwLCAxLjApICoqIDEuNTsgLy8gWzAuMCwgMS4wXVxuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSAwLjUgLyAoMS4wICsgMTkgKiBwZXJjZW50KTsgLy8gWzAuMDI1LCAwLjVdXG4gICAgICAgIHJldHVybiAoY3VycmVudEdhaW4gLyB0aGlzLm1heEdhaW4pICogbWF4TGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGF5KCkge1xuICAgICAgICBpZiAoIXRoaXMucGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwaXBlIHBsYXllZCcpO1xuXG4gICAgICAgICAgICBjb25zdCBub3cgPSB0aGlzLm91dHB1dC5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEdhaW4gPSB0aGlzLmdhaW4uZ2Fpbi52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhub3cpO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoY3VycmVudEdhaW4sIG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLm1heEdhaW4sIG5vdyArIHRoaXMuZ2V0QXR0YWNrTGVuZ3RoKGN1cnJlbnRHYWluKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGlwZSBzdG9wcGVkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHRoaXMub3V0cHV0LmNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50R2FpbiA9IHRoaXMuZ2Fpbi5nYWluLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2Fpbiwgbm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIG5vdyArIHRoaXMuZ2V0RGVjYXlMZW5ndGgoY3VycmVudEdhaW4pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Pcmdhbi50cyJdLCJzb3VyY2VSb290IjoiIn0=