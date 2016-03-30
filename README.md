# Tracker Server

Just a simple event base tracker base server

```js

var TrackerServer = require('tracker-server');

var trackerServer = new TrackerServer();

trackerServer.on("connect", function(data, client) {
  console.log("connected", data);
  // Send new data point every 10s after connect
  client.write("**,imei:"+data.imei+",C,10s");
});
trackerServer.on("data", function(data, client) {
  console.log("data", data);
});
trackerServer.on("error", function(data, client) {
  console.log("error", data);
});

console.log("listening on port 9000");
trackerServer.create().listen(9000);
```
