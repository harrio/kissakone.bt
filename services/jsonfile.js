var fs = require('fs');
var q = require('q');


var me = module.exports;

me.spaces = 2;

var readFileQ = q.nfbind(fs.readFile);

var parse = function (data) {
    return JSON.parse(data);
};

function readFile(file) {
    return readFileQ(file).then(parse);
}
exports.readFile = readFile;

var writeFileQ = q.nfbind(fs.writeFile);

var stringify = function (obj) {
    return JSON.stringify(obj, null, module.exports.spaces);
};

function writeFile(file, obj) {
    console.log("writeFileQ: " + file);
    return writeFileQ(file, stringify(obj));
}
exports.writeFile = writeFile;

function readFileSync(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
exports.readFileSync = readFileSync;

