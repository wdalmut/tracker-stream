var stream = require('stream');
var util = require('util');
var parse = require('tk10x-parser');
var Transform = stream.Transform;

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

module.exports = Tk104Stream;
