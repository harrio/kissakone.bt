///<reference path='../node/underscore.d.ts' />
///<reference path='../node/Q.d.ts' />
var q = require('q');
var jf = require('./jsonfile');
var _ = require('underscore');

var FILE = "kissa.json";

function findById(id) {
    console.log('Retrieving run: ' + id);
    return jf.readFile(FILE).then(function (runs) {
        if (runs === null || runs.length === 0) {
            return null;
        }
        return _.find(runs, function (run) {
            return run.id == id;
        });
    }).fail(function (err) {
        return err;
    });
}
exports.findById = findById;
;

var filterRuns = function (done) {
    return function (runs) {
        if (runs !== null && runs.length > 0) {
            return _.filter(runs, function (run) {
                return run.done === done;
            });
        } else {
            console.log("no runs");
            return [];
        }
    };
};

function findAll() {
    var promise = jf.readFile(FILE);
    return promise;
}
exports.findAll = findAll;
;

function findAllUndone() {
    var promise = jf.readFile(FILE);
    return promise.then(filterRuns(false));
}
exports.findAllUndone = findAllUndone;
;

function findAllDone() {
    var promise = jf.readFile(FILE);
    return promise.then(filterRuns(true));
}
exports.findAllDone = findAllDone;
;

function findBeforeDate(querydate) {
    console.log("Find before: " + querydate);
    return jf.readFile(FILE).then(function (runs) {
        if (runs !== null && runs.length > 0) {
            return _.find(runs, function (thisRun) {
                return new Date(thisRun.date) < querydate && !thisRun.done;
            });
        } else {
            return null;
        }
    }).fail(function (err) {
        return null;
    });
}
exports.findBeforeDate = findBeforeDate;
;

function addRun(run) {
    delete run.time;
    run.done = false;
    run.date = new Date(run.date);
    return exports.findAll().then(function (runs) {
        if (runs === null || runs.length === 0) {
            return { runs: [], maxId: 0 };
        }
        var maxId = _.max(runs, function (run) {
            return run.id;
        }).id;
        return { runs: runs, maxId: maxId };
    }).then(function (runsAndMaxId) {
        run.id = runsAndMaxId.maxId + 1;
        runsAndMaxId.runs.push(run);
        return runsAndMaxId.runs;
    }).then(function (runs) {
        return jf.writeFile(FILE, runs);
    });
}
exports.addRun = addRun;
;

function updateRun(id, run) {
    delete run.time;
    run.date = new Date(run.date);
    return exports.findAll().then(function (runs) {
        if (runs === null || runs.length === 0) {
            runs = [];
        }
        var updateRuns = _.reject(runs, function (thisRun) {
            return thisRun.id == id;
        });
        updateRuns.push(run);
        return updateRuns;
    }).then(function (runs) {
        return jf.writeFile(FILE, runs);
    });
}
exports.updateRun = updateRun;
;

function deleteRun(id) {
    console.log('Deleting run: ' + id);
    return exports.findAll().then(function (runs) {
        if (runs === null || runs.length === 0) {
            runs = [];
        }
        var updateRuns = _.reject(runs, function (thisRun) {
            return thisRun.id == id;
        });
        return updateRuns;
    }).then(function (runs) {
        return jf.writeFile(FILE, runs);
    });
}
exports.deleteRun = deleteRun;
;

