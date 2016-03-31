var stream = require('stream');
var util = require('util');
var Duplex = stream.Duplex;
var net = require('net');
var parse = require('tk10x-parser');
var Tk104Stream = require('.');

net.createServer(function(client) {
  client.pipe(new Tk104Stream()).on('data', function(data) {
    console.log(JSON.parse(data));
  });
}).listen(9000);
