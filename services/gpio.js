///<reference path='../node/gpio.d.ts' />
var gpio = require("gpio");

var gpio17;
var gpio18;
var gpio24;

function forwardOn() {
    gpio17 = gpio.exportz(17, {
        direction: 'out',
        ready: function () {
            gpio17.set();
        }
    });
}
exports.forwardOn = forwardOn;
;

function forwardOff() {
    if (gpio17) {
        gpio17.reset();
        gpio17.unexport();
    }
}
exports.forwardOff = forwardOff;
;

function reverseOn() {
    gpio17 = gpio.exportz(18, {
        direction: 'out',
        ready: function () {
            gpio18.set();
        }
    });
}
exports.reverseOn = reverseOn;
;

function reverseOff() {
    if (gpio18) {
        gpio18.reset();
        gpio18.unexport();
    }
}
exports.reverseOff = reverseOff;
;

function registerListener(callback) {
    console.log("Registering listener...");
    gpio24 = gpio.exportz(24, {
        direction: 'in',
        ready: function () {
            gpio24.on("change", callback);
            console.log("...done");
        }
    });
}
exports.registerListener = registerListener;
;

function unregisterListener() {
    console.log("Unregistering listener");
    gpio24.removeAllListeners('change');
    gpio24.reset();
    gpio24.unexport();
}
exports.unregisterListener = unregisterListener;
;

