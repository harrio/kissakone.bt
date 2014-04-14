///<reference path='../node/gpio.d.ts' />
import gpio = require("gpio");

var gpio17;
var gpio18;
var gpio24;

export function forwardOn() {
	gpio17 = gpio.exportz(17, {
	   	direction: 'out',

   		ready: function() {
    		gpio17.set();                 // sets pin to high
   		}
	});
};

export function forwardOff() {
    if (gpio17) {
    	gpio17.reset();                 // sets pin to high
   		gpio17.unexport();
   	}
};

export function reverseOn() {
  gpio18 = gpio.exportz(18, {
      direction: 'out',

      ready: function() {
        gpio18.set();                 // sets pin to high
      }
  });
};

export function reverseOff() {
    if (gpio18) {
      gpio18.reset();                 // sets pin to high
      gpio18.unexport();
    }
};

export function registerListener(callback: (data: any) => any) {
    console.log("Registering listener...");
    gpio24 = gpio.exportz(24, {
      direction: 'in',

      ready: function() {
          gpio24.on("change", callback);
          console.log("...done");
      }
    });
};

export function unregisterListener() {
  console.log("Unregistering listener");
    gpio24.removeAllListeners('change');   // unbinds change event
    gpio24.reset();                        // sets header to low
    gpio24.unexport();
};