var util = require('util');
var EventEmitter = require('events');
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var parse = require('tk10x-parser');

function Tracker() {
  EventEmitter.call(this);
}
util.inherits(Tracker, EventEmitter);

Tracker.prototype.write = function(data, client) {
  switch (data.type) {
    case 'DATA':
      this.emit("data", data, client);
      break;
    case 'CONNECT':
      this.emit("connect", data, client);
      break;
    default:
      this.emit("error", data, client);
      break;
  }
};

Tracker.prototype.create = function() {
  var that = this;
  var server = net.createServer(function(client) {
    var data = "";
    client.on('data', function(chunk) {
      data += chunk.toString();
      if(data.indexOf(";") === -1) return;
      var messagesToProcess = data.split(";");
      for (var i = 0; i < messagesToProcess.length -1; i++) {
        var message = parse(messagesToProcess[i]);
        that.write(message, client);
      }
      data = data.slice(data.lastIndexOf(";")+1);
    });
  });
  return server;
};

module.exports = Tracker;
