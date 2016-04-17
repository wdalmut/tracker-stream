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

  this.settings = {};
  this.byTime.seconds.every(10);
}
util.inherits(Tk104Reply, Duplex);

Tk104Reply.prototype.__defineGetter__('byDistance', function(meters) {
  this.settings.pad = 4;
  return this;
});

Tk104Reply.prototype.__defineGetter__('byTime', function(meters) {
  this.settings.pad = 2;
  return this;
});

Tk104Reply.prototype.__defineGetter__('meters', function(meters) {
  this.settings.type = "m";
  return this;
});

Tk104Reply.prototype.__defineGetter__('minutes', function(meters) {
  this.settings.type = "m";
  return this;
});

Tk104Reply.prototype.__defineGetter__('seconds', function(meters) {
  this.settings.type = "s";
  return this;
});


Tk104Reply.prototype.every = function(every) { //reply.byDistance.every(50).meters
  this.settings.every= every;
  return this;
};

Tk104Reply.prototype.replyFor = function(imei) {
  var pad = Array(this.settings.pad+1).join("0");
  var line = pad.substring(0, pad.length - (""+this.settings.every).length) + this.settings.every + this.settings.type;

  return "**,imei:"+imei+",C,"+line;
};

Tk104Reply.prototype._read = function readBytes(n) {
  var self = this;
  while (this.pieces.length) {
    var chunk = this.pieces.shift();

    switch(chunk.type) {
      case 'CONNECT':
        self.push("LOAD");
        self.push(this.replyFor(chunk.imei));
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
