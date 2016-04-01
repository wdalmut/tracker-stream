# Tracker Stream

Tracker GPS tk104 stream resources

```js
var net = require('net');
var Tk104Stream = require('tracker-stream').Tk104Stream;
var Tk104Reply = require('tracker-stream').Tk104Reply;

net.createServer(function(client) {
  client.pipe(new Tk104Stream()).on('data', function(data) {
    console.log(JSON.parse(data));
  }).pipe(new Tk104Reply()).pipe(client);
}).listen(9000);
```
