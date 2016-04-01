var net = require('net');
var Tk104Reply = require('.').Tk104Reply;
var Tk104Stream = require('.').Tk104Stream;

net.createServer(function(client) {
  client.pipe(new Tk104Stream()).on('data', function(data) {
    //console.log(JSON.parse(data));
  }).pipe(new Tk104Reply()).pipe(client);
}).listen(9000);
