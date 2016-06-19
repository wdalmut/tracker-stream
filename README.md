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

## Use reply every x meters|seconds|minutes

```js
// every 50 meters
socket.pipe(new Tk104Reply().byDistance.every(50).meters).pipe(socket);

// every 3 seconds
socket.pipe(new Tk104Reply().byTime.every(3).seconds).pipe(socket);

// every 7 minutes
socket.pipe(new Tk104Reply().byTime.every(7).minutes).pipe(socket);
```

## SMS mode after a timeout

Send the SMS mode after a while in the same place.

```js
socket.pipe(new Tk104Reply({
  distance: 10,        // 10 meters
  timeout: 1000*10*60, // 10 minutes
})).pipe(socket);
```

