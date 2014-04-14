///<reference path='../node/underscore.d.ts' />
///<reference path='../node/Q.d.ts' />
import q = require('q');
import jf = require('./jsonfile');
import _ = require('underscore');
 
var FILE = "kissa.json";

export interface Run {
    id: number;
    name: string;
    time: any;
    date: any;
    done: boolean;
}

export function findById(id: number): q.Promise<Run> {
    console.log('Retrieving run: ' + id);
    return jf.readFile(FILE)
    .then(function(runs: Run[]) {
        if (runs === null || runs.length === 0)
        {
            return null;
        }
        return _.find(runs, function(run: Run) { return run.id == id; });
    })
    .fail(function(err) {
        return err;
    });
};
 
var filterRuns = function(done: boolean) {
    return function(runs: Run[]) {
        if (runs !== null && runs.length > 0) {
            return _.filter(runs, function(run: Run) { return run.done === done; });
        } else {
            console.log("no runs");
            return [];
        }
    };
};

export function findAll(): q.Promise<Run[]> {
    var promise = jf.readFile(FILE);
    return promise;
};

export function findAllUndone(): q.Promise<Run[]> {
    var promise = jf.readFile(FILE);
    return promise.then(filterRuns(false));
};

export function findAllDone(): q.Promise<Run[]> {
    var promise = jf.readFile(FILE);
    return promise.then(filterRuns(true));
};
 
export function findBeforeDate(querydate: Date): q.Promise<Run> {
    console.log("Find before: " + querydate);
    return jf.readFile(FILE)
    .then(function(runs: Run[]): Run {
        if (runs !== null && runs.length > 0) {
            return _.find(runs, function(thisRun: Run) { return new Date(thisRun.date) < querydate && !thisRun.done; });
        } else {
            return null;
        }
    })
    .fail(function(err) {
        return null;
    });
};

export function addRun(run: Run) {
    delete run.time;
    run.done = false;
    run.date = new Date(run.date);
    return findAll()
        .then(function(runs) {
            if (runs === null || runs.length === 0) {
                return { runs: [], maxId: 0 };
            }
            var maxId = _.max(runs, function(run) { return run.id; }).id;
            return { runs: runs, maxId: maxId };
        })
        .then(function(runsAndMaxId) {
            run.id = runsAndMaxId.maxId + 1;
            runsAndMaxId.runs.push(run);
            return runsAndMaxId.runs;
        })
        .then(function(runs) {
            return jf.writeFile(FILE, runs);
        });
};
 
export function updateRun(id, run) {
    delete run.time;
    run.date = new Date(run.date);
    return findAll()
        .then(function(runs) {
            if (runs === null || runs.length === 0) {
                runs = [];
            }
            var updateRuns = _.reject(runs, function(thisRun) {
                return thisRun.id == id; });
            updateRuns.push(run);
            return updateRuns;
        })
        .then(function(runs) {
            return jf.writeFile(FILE, runs);
        });
};
 
export function deleteRun(id) {
    console.log('Deleting run: ' + id);
    return findAll()
        .then(function(runs) {
            if (runs === null || runs.length === 0) {
                runs = [];
            }
            var updateRuns = _.reject(runs, function(thisRun) {
                return thisRun.id == id; });
            return updateRuns;
        })
        .then(function(runs) {
            return jf.writeFile(FILE, runs);
        });
};
 
