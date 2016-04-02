'use strict';

var stream = require('stream');
var util = require('util');
var parse = require('tk10x-parser');
var Transform = stream.Transform;
var Duplex = stream.Duplex;

function Tk104Stream(options) {
  Transform.call(this, options);
  this.pieces = [];
}
util.inherits(Tk104Stream, Transform);

Tk104Stream.prototype._transform = function (chunk, enc, cb) {
  this.pieces.push(chunk.toString().replace(/[\n\r]/g, ''));

  var self = this;
  while (this.pieces.length) {
    var data = this.pieces.splice(0, this.pieces.length).join('');

    if(data.indexOf(";") === -1) {
      this.pieces.unshift(data);
      break;
    }

    var messagesToProcess = data.split(";");
    for (var i = 0; i < messagesToProcess.length -1; i++) {
      var message = parse(messagesToProcess[i]);
      self.push(JSON.stringify(message));
    }
    data = data.slice(data.lastIndexOf(";")+1);
    this.pieces.unshift(data);
  }

  cb();
};

function Tk104Reply(options) {
  Duplex.call(this, options);
  this.pieces = [];
  this.stop = false;

  this.on('end', function() {
    this.stop = true;
  });
}
util.inherits(Tk104Reply, Duplex);

Tk104Reply.prototype._read = function readBytes(n) {
  var self = this;
  while (this.pieces.length) {
    var chunk = this.pieces.shift();

    switch(chunk.type) {
      case 'CONNECT':
        self.push("LOAD");
        self.push("**,imei:"+chunk.imei+",C,10s");
        break;
      case 'UNKNOWN':
        self.push("ON");
        break;
      case 'DATA':
        break;
    }
  }

  if (!this.stop) {
    setTimeout(readBytes.bind(self), 1000, n);
  }
};

Tk104Reply.prototype._write = function(chunk, enc, cb) {
  var message = JSON.parse(chunk);
  this.pieces.push(message);
  cb();
};

exports.Tk104Stream = Tk104Stream;
exports.Tk104Reply = Tk104Reply;
