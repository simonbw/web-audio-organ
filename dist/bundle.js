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
        wet.gain.setTargetAtTime(amount, context.currentTime, 0.01);
        dry.gain.setTargetAtTime(1.0 - amount, context.currentTime, 0.01);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMmZmOTllYTIwODY2YzhjYWNmYmIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9WaXN1YWxpemVyLnRzIiwid2VicGFjazovLy8uL3NyYy9LZXlib2FyZENvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL09yZ2FuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQTs7OztHQUlHO0FBQ0gsMEJBQWlDLEtBQWE7SUFDMUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUZELDRDQUVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxtQkFBMEIsR0FBVyxFQUFFLEdBQVc7SUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCw4QkFFQztBQUVEOzs7Ozs7R0FNRztBQUNI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QztRQUN0RixDQUFDO0lBQ0wsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQUFDIiwiZmlsZSI6ImRpc3QvYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMmZmOTllYTIwODY2YzhjYWNmYmIiLCIvKipcbiAqIENvbnZlcnRzIGEgcGl0Y2ggZ2l2ZSBpbiBzZW1pdG9uZXMgYWJvdmUgQTQgdG8gYSBmcmVxdWVuY3kgaW4gSHouXG4gKiBAcGFyYW0gcGl0Y2hcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpdGNoVG9GcmVxdWVuY3kocGl0Y2g6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIDQ0MCAqIE1hdGgucG93KDIsIHBpdGNoIC8gMTIuMCk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSByYW5kb20gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW21pbiwgbWF4KVxuICogQHBhcmFtIG1pblxuICogQHBhcmFtIG1heFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKTtcbn1cblxuLyoqXG4gKiBDbGFtcCB2YWx1ZSB0byB0aGUgcmFuZ2UgW21pbiwgbWF4XVxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0gbWluXG4gKiBAcGFyYW0gbWF4XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciA9IC0xLjAsIG1heDogbnVtYmVyID0gMS4wKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4odmFsdWUsIG1heCksIG1pbik7XG59XG5cbi8qKlxuICogTG9hZHMgYSBzb3VuZCBmcm9tIGEgZmlsZW5hbWUuXG4gKiBAcGFyYW0gY29udGV4dFxuICogQHBhcmFtIGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtQcm9taXNlPFJlc3BvbnNlPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTb3VuZChjb250ZXh0OiBBdWRpb0NvbnRleHQsIGZpbGVuYW1lOiBzdHJpbmcpOiBQcm9taXNlPEF1ZGlvQnVmZmVyPiB7XG4gICAgcmV0dXJuIGZldGNoKGBzb3VuZHMvJHtmaWxlbmFtZX1gKVxuICAgICAgICAudGhlbigocmVzcG9uc2U6IFJlc3BvbnNlKSA9PiByZXNwb25zZS5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAudGhlbigoYXJyYXlCdWZmZXI6IEFycmF5QnVmZmVyKSA9PiBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShhcnJheUJ1ZmZlcikpO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsLnRzIiwiaW1wb3J0IHsgbG9hZFNvdW5kIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IFZpc3VhbGl6ZXIgfSBmcm9tICcuL1Zpc3VhbGl6ZXInO1xuaW1wb3J0IEtleWJvYXJkQ29udHJvbGxlciBmcm9tIFwiLi9LZXlib2FyZENvbnRyb2xsZXJcIjtcbmltcG9ydCBPcmdhbiBmcm9tIFwiLi9PcmdhblwiO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICBjb25zdCBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBuZXcgKEF1ZGlvQ29udGV4dCkoKTtcbiAgICBjb25zdCBvcmdhbiA9IG5ldyBPcmdhbihjb250ZXh0KTtcbiAgICBvcmdhbi5hY3RpdmF0ZVJhbmtzKDAsIDEsIDIsIDMsIDQsIDUpO1xuICAgIGNvbnN0IHJldmVyYiA9IGNvbnRleHQuY3JlYXRlQ29udm9sdmVyKCk7XG5cbiAgICAvLyBMaW1pdCB0aGUgdm9sdW1lXG4gICAgY29uc3QgZHluYW1pY3MgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xuICAgIGR5bmFtaWNzLnRocmVzaG9sZC52YWx1ZSA9IC0yMDtcbiAgICBkeW5hbWljcy5yYXRpby52YWx1ZSA9IDEwO1xuXG4gICAgY29uc3QgdmlzdWFsaXplciA9IG5ldyBWaXN1YWxpemVyKGNvbnRleHQpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlzdWFsaXplci5lbGVtZW50KTtcblxuICAgIGNvbnN0IHdldCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIGNvbnN0IGRyeSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgZnVuY3Rpb24gc2V0UmV2ZXJiQW1vdW50KGFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIHdldC5nYWluLnNldFRhcmdldEF0VGltZShhbW91bnQsIGNvbnRleHQuY3VycmVudFRpbWUsIDAuMDEpO1xuICAgICAgICBkcnkuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMS4wIC0gYW1vdW50LCBjb250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxKTtcbiAgICB9XG5cbiAgICBvcmdhbi5vdXRwdXQuY29ubmVjdChyZXZlcmIpO1xuICAgIG9yZ2FuLm91dHB1dC5jb25uZWN0KGRyeSk7XG4gICAgcmV2ZXJiLmNvbm5lY3Qod2V0KTtcbiAgICB3ZXQuY29ubmVjdChkeW5hbWljcyk7XG4gICAgZHJ5LmNvbm5lY3QoZHluYW1pY3MpO1xuICAgIGR5bmFtaWNzLmNvbm5lY3QodmlzdWFsaXplci5pbnB1dCk7XG4gICAgZHluYW1pY3MuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAgIHNldFJldmVyYkFtb3VudCgwLjApOyAvLyBUdXJuIHJldmVyYiBvZmYgdW50aWwgc291bmQgbG9hZHNcbiAgICBsb2FkU291bmQoY29udGV4dCwgJ3N0YWxiYW5zX2Ffb3J0Zi53YXYnKVxuICAgICAgICAudGhlbihhdWRpb0J1ZmZlciA9PiB7XG4gICAgICAgICAgICByZXZlcmIuYnVmZmVyID0gYXVkaW9CdWZmZXI7XG4gICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMS4wKTsgLy8gZW5hYmxlIHJldmVyYiBvbmNlIHNvdW5kIGxvYWRzXG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xuXG4gICAgbmV3IEtleWJvYXJkQ29udHJvbGxlcihvcmdhbik7XG5cbiAgICAvLyBmb3IgZGVidWdnaW5nXG4gICAgd2luZG93WydvcmdhbiddID0gb3JnYW47XG4gICAgd2luZG93Wydjb250ZXh0J10gPSBjb250ZXh0O1xuXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQubWV0YUtleSAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZSA9PSAnS2V5WicpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMS4wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5WCcpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMC41KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY29kZSA9PSAnS2V5QycpIHtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcmJBbW91bnQoMC4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXgudHMiLCJleHBvcnQgY2xhc3MgVmlzdWFsaXplciB7XG4gICAgcHVibGljIGlucHV0OiBBdWRpb05vZGU7XG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhbmFseXNlcjogQW5hbHlzZXJOb2RlO1xuICAgIHByaXZhdGUgYW5hbHlzZXJEYXRhOiBVaW50OEFycmF5O1xuICAgIHByaXZhdGUgYmFyczogQXJyYXk8SFRNTEVsZW1lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgdGhpcy5hbmFseXNlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICAgICAgICB0aGlzLmFuYWx5c2VyLmZmdFNpemUgPSAyMDQ4O1xuICAgICAgICB0aGlzLmFuYWx5c2VyRGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpO1xuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5hbmFseXNlcjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnVmlzdWFsaXplcicpO1xuXG4gICAgICAgIHRoaXMuYmFycyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI0OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYmFyLmNsYXNzTGlzdC5hZGQoJ1Zpc3VhbGl6ZXItYmFyJyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoYmFyKTtcbiAgICAgICAgICAgIHRoaXMuYmFycy5wdXNoKGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdygpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZHJhdygpKTtcblxuICAgICAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKHRoaXMuYW5hbHlzZXJEYXRhKTtcblxuICAgICAgICB0aGlzLmJhcnMuZm9yRWFjaCgoYmFyLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0QmFyVmFsdWUoaSk7XG4gICAgICAgICAgICBiYXIuc3R5bGUuaGVpZ2h0ID0gYCR7dmFsdWUgKiAxMDB9JWA7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAwLjk1KSB7XG4gICAgICAgICAgICAgICAgYmFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGAjRjAwYDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPiAwLjgpIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRjBgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYCNGRkZgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QmFyVmFsdWUoaTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZGF0YVBlckJhciA9IHRoaXMuYW5hbHlzZXJEYXRhLmxlbmd0aCAvIHRoaXMuYmFycy5sZW5ndGg7XG4gICAgICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5mbG9vcigoaSAqIGRhdGFQZXJCYXIpKTtcbiAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBNYXRoLmZsb29yKGRhdGFQZXJCYXIpO1xuICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBlbmQ7IGorKykge1xuICAgICAgICAgICAgdmFsdWUgPSBNYXRoLm1heCh0aGlzLmFuYWx5c2VyRGF0YVtqXSAvIDI1NiwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cblxuLy8gY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLmVsZW1lbnQ7XG4vLyBjb25zdCBjYW52YXNDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbi8vXG4vLyBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoMjAwLCAyMDAsIDIwMCknO1xuLy8gY2FudmFzQ29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVdpZHRoID0gMjtcbi8vIGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSAncmdiKDAsIDAsIDApJztcbi8vXG4vLyBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuLy8gY29uc3Qgc2xpY2VXaWR0aCA9IGNhbnZhcy53aWR0aCAvIHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQ7XG4vL1xuLy8gZm9yIChsZXQgaSA9IDAsIHggPSAwOyBpIDwgdGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDsgaSsrKSB7XG4vL1xuLy8gICAgIGNvbnN0IHYgPSB0aGlzLmFuYWx5c2VyRGF0YVtpXSAvIDEyOC4wO1xuLy8gICAgIGNvbnN0IHkgPSB2ICogY2FudmFzLmhlaWdodCAvIDI7XG4vL1xuLy8gICAgIGlmIChpID09PSAwKSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKHgsIHkpO1xuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIGNhbnZhc0NvbnRleHQubGluZVRvKHgsIHkpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgeCArPSBzbGljZVdpZHRoO1xuLy8gfVxuLy9cbi8vIGNhbnZhc0NvbnRleHQubGluZVRvKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCAvIDIpO1xuLy8gY2FudmFzQ29udGV4dC5zdHJva2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9WaXN1YWxpemVyLnRzIiwiaW1wb3J0IE9yZ2FuIGZyb20gXCIuL09yZ2FuXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleWJvYXJkQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob3JnYW46IE9yZ2FuKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuY3RybEtleSAmJiAhZXZlbnQubWV0YUtleSAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHBpdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yZ2FuLnBsYXkocGl0Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByYW5rID0gdGhpcy5rZXlUb1JhbmsoZXZlbnQuY29kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmsgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW4udG9nZ2xlUmFuayhyYW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGl0Y2ggPSB0aGlzLmtleVRvUGl0Y2goZXZlbnQuY29kZSk7XG4gICAgICAgICAgICBpZiAocGl0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvcmdhbi5zdG9wKHBpdGNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1BpdGNoKGNvZGUpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBrZXlQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgICdLZXlRJywgLy8gRyNcbiAgICAgICAgICAgICdLZXlBJywgLy8gQVxuICAgICAgICAgICAgJ0tleVcnLCAvLyBBI1xuICAgICAgICAgICAgJ0tleVMnLCAvLyBCXG4gICAgICAgICAgICAvLyAnS2V5RScsXG4gICAgICAgICAgICAnS2V5RCcsIC8vIENcbiAgICAgICAgICAgICdLZXlSJywgLy8gQyNcbiAgICAgICAgICAgICdLZXlGJywgLy8gRFxuICAgICAgICAgICAgJ0tleVQnLCAvLyBEI1xuICAgICAgICAgICAgJ0tleUcnLCAvLyBFXG4gICAgICAgICAgICAvLyAnS2V5WScsXG4gICAgICAgICAgICAnS2V5SCcsIC8vIEZcbiAgICAgICAgICAgICdLZXlVJywgLy8gRiNcbiAgICAgICAgICAgICdLZXlKJywgLy8gR1xuICAgICAgICAgICAgJ0tleUknLCAvLyBHI1xuICAgICAgICAgICAgJ0tleUsnLCAvLyBBXG4gICAgICAgICAgICAnS2V5TycsIC8vIEEjXG4gICAgICAgICAgICAnS2V5TCcsIC8vIEJcbiAgICAgICAgICAgIC8vICdLZXlQJyxcbiAgICAgICAgICAgICdTZW1pY29sb24nLCAvLyBDXG4gICAgICAgICAgICAnQnJhY2tldExlZnQnLCAvLyBDI1xuICAgICAgICAgICAgJ1F1b3RlJywgLy8gRFxuICAgICAgICAgICAgJ0JyYWNrZXRSaWdodCcsIC8vIEQjXG4gICAgICAgICAgICAnRW50ZXInLCAvLyBFXG4gICAgICAgIF0uaW5kZXhPZihjb2RlKTtcbiAgICAgICAgaWYgKGtleVBvc2l0aW9uID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlQb3NpdGlvbiAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlUb1JhbmsoY29kZSk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGtleVBvc2l0aW9uID0gW1xuICAgICAgICAgICAgJ0RpZ2l0MScsXG4gICAgICAgICAgICAnRGlnaXQyJyxcbiAgICAgICAgICAgICdEaWdpdDMnLFxuICAgICAgICAgICAgJ0RpZ2l0NCcsXG4gICAgICAgICAgICAnRGlnaXQ1JyxcbiAgICAgICAgICAgICdEaWdpdDYnLFxuICAgICAgICAgICAgJ0RpZ2l0NycsXG4gICAgICAgICAgICAnRGlnaXQ4JyxcbiAgICAgICAgICAgICdEaWdpdDknXG5cbiAgICAgICAgXS5pbmRleE9mKGNvZGUpO1xuICAgICAgICBpZiAoa2V5UG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleVBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvS2V5Ym9hcmRDb250cm9sbGVyLnRzIiwiaW1wb3J0IHsgcGl0Y2hUb0ZyZXF1ZW5jeSwgY2xhbXAgfSBmcm9tICcuL3V0aWwnO1xuXG4vLyBUT0RPOiBEb24ndCBoYXZlIHNvIG1hbnkgb3NjaWxsYXRvcnMgYWxsIHRoZSB0aW1lLiBBbmQgZmlndXJlIG91dCBvdGhlciB3YXlzIHRvIHJlZHVjZSBjb21wdXRhdGlvbi5cblxuLyoqXG4gKiBBbiBvcmdhbiBpcyBhIGNvbGxlY3Rpb24gb2YgcmFua3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZ2FuIHtcbiAgICBwcml2YXRlIHJhbmtzOiBBcnJheTxSYW5rPjtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBhY3RpdmVSYW5rczogQXJyYXk8UmFuaz47XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQpIHtcbiAgICAgICAgY29uc3QgZ2FpbiA9IHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IDAuMTtcblxuICAgICAgICBjb25zdCB0cmVtdWxhdG9yT3NjaWxsYXRvciA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5mcmVxdWVuY3kudmFsdWUgPSAzLjA7XG4gICAgICAgIHRyZW11bGF0b3JPc2NpbGxhdG9yLnN0YXJ0KCk7XG4gICAgICAgIGNvbnN0IHRyZW11bGF0b3JTdHJlbmd0aCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0cmVtdWxhdG9yT3NjaWxsYXRvci5jb25uZWN0KHRyZW11bGF0b3JTdHJlbmd0aCk7XG4gICAgICAgIHRyZW11bGF0b3JTdHJlbmd0aC5nYWluLnZhbHVlID0gMC4yO1xuXG4gICAgICAgIHRoaXMuYWN0aXZlUmFua3MgPSBbXTtcbiAgICAgICAgdGhpcy5yYW5rcyA9IFtdO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMzYsIDIuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMjQsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAtMTIsIDEuMCkpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAwLCAxLjApKTtcbiAgICAgICAgdGhpcy5yYW5rcy5wdXNoKG5ldyBSYW5rKGNvbnRleHQsIHRyZW11bGF0b3JTdHJlbmd0aCwgMTIsIDAuNykpO1xuICAgICAgICB0aGlzLnJhbmtzLnB1c2gobmV3IFJhbmsoY29udGV4dCwgdHJlbXVsYXRvclN0cmVuZ3RoLCAyNCwgMC41KSk7XG4gICAgICAgIC8vIHRoaXMucmFua3MucHVzaChuZXcgUmFuayhjb250ZXh0LCB0cmVtdWxhdG9yU3RyZW5ndGgsIDM2KSk7XG4gICAgICAgIHRoaXMucmFua3MuZm9yRWFjaCgocmFuaykgPT4gcmFuay5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCkpXG4gICAgfVxuXG4gICAgcHVibGljIGlzUmFua0FjdGl2ZShyYW5rSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLnZhbGlkYXRlUmFuayhyYW5rSW5kZXgpO1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHRoaXMucmFua3NbcmFua0luZGV4XSkgPj0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlUmFuayhyYW5rSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuaXNSYW5rQWN0aXZlKHJhbmtJbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0aXZhdGVSYW5rKHJhbmtJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVSYW5rKHJhbmtJbmRleCk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSB0aGlzLnJhbmtzW3JhbmtJbmRleF07XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVJhbmtzLmluZGV4T2YocmFuaykgPT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUmFua3MucHVzaChyYW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBY3RpdmF0ZSByYW5rICR7cmFua0luZGV4fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFjdGl2YXRlUmFua3MoLi4ucmFua0luZGV4ZXM6IEFycmF5PG51bWJlcj4pIHtcbiAgICAgICAgcmFua0luZGV4ZXMuZm9yRWFjaCgocmFua0luZGV4KSA9PiB0aGlzLmFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmtzKC4uLnJhbmtJbmRleGVzOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIHJhbmtJbmRleGVzLmZvckVhY2goKHJhbmtJbmRleCkgPT4gdGhpcy5kZWFjdGl2YXRlUmFuayhyYW5rSW5kZXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZVJhbmsocmFua0luZGV4KTtcbiAgICAgICAgY29uc3QgcmFuayA9IHRoaXMucmFua3NbcmFua0luZGV4XTtcbiAgICAgICAgY29uc3QgYWN0aXZlUmFua0luZGV4ID0gdGhpcy5hY3RpdmVSYW5rcy5pbmRleE9mKHJhbmspO1xuICAgICAgICBpZiAoYWN0aXZlUmFua0luZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLnNwbGljZShhY3RpdmVSYW5rSW5kZXgsIDEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYERlYWN0aXZhdGUgcmFuayAke3JhbmtJbmRleH1gKTtcbiAgICAgICAgICAgIHJhbmsuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVJhbmsocmFua0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJhbmtJbmRleCA8IDAgfHwgcmFua0luZGV4ID49IHRoaXMucmFua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW52YWxpZCBSYW5rOiAke3JhbmtJbmRleH1gKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2ZVJhbmtzLmZvckVhY2goKHJhbmspID0+IHtcbiAgICAgICAgICAgIHJhbmsucGxheShwaXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKHBpdGNoOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmVSYW5rcy5mb3JFYWNoKChyYW5rKSA9PiB7XG4gICAgICAgICAgICByYW5rLnN0b3AocGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSByYW5rIGlzIGEgc2V0IG9mIHBpcGVzLlxuICovXG5jbGFzcyBSYW5rIHtcbiAgICBwcml2YXRlIHBpcGVzOiB7IFtwaXRjaDogbnVtYmVyXTogUGlwZSB9O1xuICAgIHB1YmxpYyBvdXRwdXQ6IEF1ZGlvTm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCwgdHJlbXVsYXRvcjogQXVkaW9Ob2RlLCBvZmZzZXQ6IG51bWJlciwgZ2FpbkFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgZ2Fpbi5nYWluLnZhbHVlID0gZ2FpbkFtb3VudDtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBnYWluO1xuXG4gICAgICAgIHRoaXMucGlwZXMgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IC0xOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGlwZSA9IG5ldyBQaXBlKGNvbnRleHQsIGkgKyBvZmZzZXQsIHRyZW11bGF0b3IpO1xuICAgICAgICAgICAgcGlwZS5vdXRwdXQuY29ubmVjdChnYWluKTtcbiAgICAgICAgICAgIHRoaXMucGlwZXNbaV0gPSBwaXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBsYXkocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5wbGF5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AocGl0Y2g6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVzW3BpdGNoXS5zdG9wKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BBbGwoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgcGl0Y2ggaW4gdGhpcy5waXBlcykge1xuICAgICAgICAgICAgdGhpcy5waXBlc1twaXRjaF0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBQaXBlIHtcbiAgICBwdWJsaWMgb3V0cHV0OiBBdWRpb05vZGU7XG4gICAgcHJpdmF0ZSBnYWluOiBHYWluTm9kZTtcbiAgICBwcml2YXRlIHBpdGNoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoaWdocGFzczogQmlxdWFkRmlsdGVyTm9kZTtcbiAgICBwcml2YXRlIHBsYXlpbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBtYXhHYWluOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQsIHBpdGNoOiBudW1iZXIsIHRyZW11bGF0b3I6IEF1ZGlvTm9kZSkge1xuICAgICAgICB0aGlzLnBpdGNoID0gcGl0Y2g7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1heEdhaW4gPSAwLjE7XG5cbiAgICAgICAgdGhpcy5nYWluID0gY29udGV4dC5jcmVhdGVHYWluKCk7IC8vIE1haW4gdm9sdW1lIGNvbnRyb2xcbiAgICAgICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMuZ2FpbjtcblxuICAgICAgICB0aGlzLmhpZ2hwYXNzID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcblxuICAgICAgICAvLyBDcmVhdGVzIHRoZSBzb3VuZFxuICAgICAgICBjb25zdCBvc2NpbGxhdG9yID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIG9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gcGl0Y2hUb0ZyZXF1ZW5jeShwaXRjaCk7XG4gICAgICAgIG9zY2lsbGF0b3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQpKTtcblxuICAgICAgICAvLyBUcmVtZWxvXG4gICAgICAgIGNvbnN0IHRyZW1lbG8gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgY29uc3QgdHJlbWVsb1N0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRyZW1lbG9TdHJlbmd0aC5nYWluLnZhbHVlID0gMS4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodHJlbWVsb1N0cmVuZ3RoKTtcbiAgICAgICAgdHJlbWVsb1N0cmVuZ3RoLmNvbm5lY3QodHJlbWVsby5nYWluKTtcblxuICAgICAgICAvLyBWaWJyYXRvXG4gICAgICAgIGNvbnN0IHZpYnJhdG9QaXRjaFN0cmVuZ3RoID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZpYnJhdG9QaXRjaFN0cmVuZ3RoLmdhaW4udmFsdWUgPSAxMC4wO1xuICAgICAgICB0cmVtdWxhdG9yLmNvbm5lY3QodmlicmF0b1BpdGNoU3RyZW5ndGgpO1xuICAgICAgICAvLyB2aWJyYXRvUGl0Y2hTdHJlbmd0aC5jb25uZWN0KG9zY2lsbGF0b3IuZGV0dW5lKTsgLy8gY2F1c2VzIHN0dXR0ZXJpbmcgZm9yIHNvbWUgcmVhc29uXG5cbiAgICAgICAgb3NjaWxsYXRvci5jb25uZWN0KHRyZW1lbG8pO1xuICAgICAgICBvc2NpbGxhdG9yLnN0YXJ0KCk7XG5cbiAgICAgICAgLy8gdHJlbWVsby5jb25uZWN0KHRoaXMuaGlnaHBhc3MpOyAvLyBjYXVzZXMgc3R1dHRlcmluZyBmb3Igc29tZSByZWFzb25cbiAgICAgICAgLy8gdGhpcy5oaWdocGFzcy5jb25uZWN0KHRoaXMuZ2Fpbik7XG4gICAgICAgIHRyZW1lbG8uY29ubmVjdCh0aGlzLmdhaW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCB0aGUgc3BlY3RydW0gZm9yIHRoZSBwaXBlLlxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHJldHVybiB7UGVyaW9kaWNXYXZlfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0UGVyaW9kaWNXYXZlKGNvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xuICAgICAgICBjb25zdCBOVU1CRVJfT0ZfSEFSTU9OSUNTID0gMTY7XG4gICAgICAgIGNvbnN0IEVWRU5fQ09FRkZJQ0lFTlQgPSAwLjM7XG4gICAgICAgIGNvbnN0IERFQ0FZID0gMy41O1xuXG4gICAgICAgIGNvbnN0IHJlYWwgPSBuZXcgRmxvYXQzMkFycmF5KE5VTUJFUl9PRl9IQVJNT05JQ1MpO1xuICAgICAgICBjb25zdCBpbWFnID0gbmV3IEZsb2F0MzJBcnJheShOVU1CRVJfT0ZfSEFSTU9OSUNTKTtcbiAgICAgICAgcmVhbFswXSA9IDA7XG4gICAgICAgIGltYWdbMF0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IE5VTUJFUl9PRl9IQVJNT05JQ1M7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgJSAyID09IDEpIHtcbiAgICAgICAgICAgICAgICByZWFsW2ldID0gMS4wIC8gKGkgKiogREVDQVkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWFsW2ldID0gRVZFTl9DT0VGRklDSUVOVCAvIChpICoqIERFQ0FZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltYWdbaV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IENoaWZmXG5cbiAgICAgICAgcmV0dXJuIGNvbnRleHQuY3JlYXRlUGVyaW9kaWNXYXZlKHJlYWwsIGltYWcsIHtkaXNhYmxlTm9ybWFsaXphdGlvbjogdHJ1ZX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGltZSB0byB3YXJtIHVwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRBdHRhY2tMZW5ndGgoY3VycmVudEdhaW46IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBjbGFtcCgodGhpcy5waXRjaCArIDM2KSAvIDcyLCAwLCAxLjApICoqIDEuNTsgLy8gWzAuMCwgMS4wXVxuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSAwLjIgLyAoMS4wICsgMTkgKiBwZXJjZW50KTsgLy8gWzAuMDEsIDAuMl1cbiAgICAgICAgcmV0dXJuICgxLjAgLSBjdXJyZW50R2FpbiAvIHRoaXMubWF4R2FpbikgKiBtYXhMZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aW1lIHRvIGNvb2wgZG93blxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGVjYXlMZW5ndGgoY3VycmVudEdhaW46IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBjbGFtcCgodGhpcy5waXRjaCArIDM2KSAvIDcyLCAwLCAxLjApICoqIDEuNTsgLy8gWzAuMCwgMS4wXVxuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSAwLjUgLyAoMS4wICsgMTkgKiBwZXJjZW50KTsgLy8gWzAuMDI1LCAwLjVdXG4gICAgICAgIHJldHVybiAoY3VycmVudEdhaW4gLyB0aGlzLm1heEdhaW4pICogbWF4TGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGF5KCkge1xuICAgICAgICBpZiAoIXRoaXMucGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwaXBlIHBsYXllZCcpO1xuXG4gICAgICAgICAgICBjb25zdCBub3cgPSB0aGlzLm91dHB1dC5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEdhaW4gPSB0aGlzLmdhaW4uZ2Fpbi52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhub3cpO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoY3VycmVudEdhaW4sIG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLm1heEdhaW4sIG5vdyArIHRoaXMuZ2V0QXR0YWNrTGVuZ3RoKGN1cnJlbnRHYWluKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGlwZSBzdG9wcGVkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHRoaXMub3V0cHV0LmNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50R2FpbiA9IHRoaXMuZ2Fpbi5nYWluLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKG5vdyk7XG4gICAgICAgICAgICB0aGlzLmdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2Fpbiwgbm93KTtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIG5vdyArIHRoaXMuZ2V0RGVjYXlMZW5ndGgoY3VycmVudEdhaW4pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Pcmdhbi50cyJdLCJzb3VyY2VSb290IjoiIn0=