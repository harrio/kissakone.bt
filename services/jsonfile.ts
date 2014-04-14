///<reference path='../node/Q.d.ts' />
import fs = require('fs');
import q = require('q');
import rd = require('./rundb');

var me = module.exports;

me.spaces = 2;

var readFileQ = q.nfbind(fs.readFile);

var parse = function(data: string): rd.Run[] {
  return JSON.parse(data);
};

export function readFile(file: string): q.Promise<rd.Run[]> {
  console.log("readFileQ: " + file);
  return readFileQ(file).then(parse);
};

var writeFileQ = q.nfbind(fs.writeFile);

var stringify = function(obj: rd.Run[]): string {
  return JSON.stringify(obj, null, module.exports.spaces);
};

export function writeFile(file: string, obj: rd.Run[]): q.Promise<any> {
  console.log("writeFileQ: " + file);
  return writeFileQ(file, stringify(obj));
};

export function readFileSync(file: string): any {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};