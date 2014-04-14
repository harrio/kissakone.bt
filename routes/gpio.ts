import gpio = require("gpio");

var gpio4;

export function gpioOn(req, res) {
	gpio4 = gpio.export(4, {
	   	direction: 'out',

   		ready: function() {

        gpio.registerListener(function(val) {
                        console.log("Switch off: " + val);
                        if (val === 1) {
                            gpio.gpioOff();
                            gpio.unregisterListener();
                        }
                    });

    		gpio4.set();                 // sets pin to high
      		console.log("on: " + gpio4.value);    // should log 1
   		}
	});
	res.send("On");
};

export function gpioOff(req, res) {
    if (gpio4) {
    	gpio4.reset();                 // sets pin to high
    	console.log("off: " + gpio4.value);    // should log 1 
   		gpio4.unexport();
   	}
	res.send("Off");
};

function cycleOne(callback) {
    var startTime = new Date().getTime();
    gpio.registerListener(function(val) {
        if (val === 1) {
            console.log("...cycled");
            gpio.gpioOff();
            gpio.unregisterListener();
            var elapsed = new Date().getTime() - startTime();
            callback(elapsed);
        }
    });
    console.log("cycle one...");
    gpio.gpioOn();
}

function cycleClicks(clicks, maincallback) {
    var done = 0;
    var callback = function(elapsed) {
        done++;
        if (done === clicks) {
            console.log("cycle done");
            maincallback();
        } else {
            console.log("cycled so far: " + done);
            cycleOne(callback);
        }
    };
    callback();
}

export function resetCycle(req, res) {
    console.log("reset");
    var callback = function(elapsed) {
        if (elapsed > 1600) {
            console.log("cycle until 6");
            cycleClicks(6, function() {
                res.send("Ok");
            });
        } else {
            console.log("cycle until gap");
            cycleOne(callback);
        }
    };
    callback();

};