var db = require('../services/rundb');
var btSerial = require('bluetooth-serial-port');

var mac = "00:13:12:31:23:96";
var port;

function findById(req, res) {
    var id = req.params.id;
    console.log('Retrieving run: ' + id);
    db.findById(id).then(function (item) {
        res.json({ run: item });
    });
}
exports.findById = findById;

function findAllUndone(req, res) {
    db.findAllUndone().then(function (items) {
        res.json({
            runs: items
        });
    });
}
exports.findAllUndone = findAllUndone;

function findAllDone(req, res) {
    db.findAllDone().then(function (items) {
        res.json({
            runsDone: items
        });
    });
}
exports.findAllDone = findAllDone;

function addRun(req, res) {
    var run = req.body;
    db.addRun(run).then(function (result) {
        console.log('Success: ' + JSON.stringify(result[0]));
        res.json(req.body);
    }).fail(function (err) {
        res.json(false);
    });
}
exports.addRun = addRun;

function updateRun(req, res) {
    var id = req.params.id;
    var run = req.body;
    if (!req.loggedIn) {
        res.json(false);
        return;
    }
    db.updateRun(id, run).then(function (result) {
        res.json(true);
    }).fail(function (err) {
        console.log('Error updating run: ' + err);
        res.json(false);
    });
}
exports.updateRun = updateRun;

function deleteRun(req, res) {
    var id = req.params.id;
    if (!req.loggedIn) {
        res.json(false);
        return;
    }
    db.deleteRun(id).then(function (result) {
        res.json(true);
    }).fail(function (err) {
        console.log('Error updating run: ' + err);
        res.json(false);
    });
}
exports.deleteRun = deleteRun;

var sendToPort = function (addr, cmd) {
    port = new btSerial.BluetoothSerialPort();
    port.findSerialPortChannel(addr, function (channel) {
        console.log("connecting to " + addr + " " + channel);
        port.connect(addr, channel, function () {
            console.log('success ' + addr + " " + channel);
            var data = "";

            port.on('data', function (buffer) {
                console.log("buffer " + buffer);
                data += buffer.toString('utf-8');
                var parts = data.split("\n");
                data = parts.pop();
                parts.forEach(function (part, i, array) {
                    console.log("resp: " + part);
                    closePort();
                });
            });

            port.write(new Buffer(cmd, 'utf-8'), function (err, bytesWritten) {
                if (err)
                    console.log(err);
            });
        }, function () {
            console.log("cannot connect " + addr);
        });
    });
};

var closePort = function () {
    if (port.isOpen()) {
        console.log("Close port");
        port.close();
    }
};


function serve() {
    sendToPort(mac, "{1 0}");
}
exports.serve = serve;

function shiftForward(req, res) {
    sendToPort(mac, "{2 0}");
    res.send("Ok");
}
exports.shiftForward = shiftForward;

function shiftReverse(req, res) {
    sendToPort(mac, "{3 0}");
    res.send("Ok");
}
exports.shiftReverse = shiftReverse;

function rotateCam(req, res) {
    var angle = req.body.angle;
    console.log("Rotete " + angle);
    sendToPort(mac, "{4 " + angle + "}");
    res.send("Ok");
}
exports.rotateCam = rotateCam;

