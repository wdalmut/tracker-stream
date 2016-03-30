var TrackerServer = require('.');

var trackerServer = new TrackerServer();
trackerServer.on("connect", function(data, client) {
  console.log("connected", data);
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
