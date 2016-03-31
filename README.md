# Tracker Stream

Tracker GPS tk104 stream resources

```js
var util = require('util');
var stream = require('stream');
var net = require('net');
var Tk104Stream = require('tracker-stream');

net.createServer(function(client) {
  client.pipe(new Tk104Stream()).on('data', function(data) {
    console.log(JSON.parse(data));
  });
}).listen(9000);
```
