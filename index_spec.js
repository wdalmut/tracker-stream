var Tracker = require('.');
var net = require('net');
var Socket = require("net").Socket;

describe("The tracker server", function() {
  var tracker = null;
  var server  = null;

  beforeEach(function() {
    tracker = new Tracker();
    spyOn(tracker, 'write');
    server = tracker.create().listen(9000);
  });

  afterEach(function() {
    server.close();
  });

  var flag;
  it("should parse a valid connection message", function() {
    runs(function() {
      flag = false;
      var socket = new Socket().connect(9000, function(){
        this.write("##,imei:787878,A;");
        socket.end();
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "We should receive a message", 1000);

    runs(function() {
      expect(tracker.write).toHaveBeenCalled();
      expect(tracker.write.calls.length).toEqual(1);
      expect(tracker.write.calls[0].args[0].type).toEqual("CONNECT");
    });
  });

  it("should parse a partial valid connection message", function() {
    runs(function() {
      flag = false;
      var socket = new Socket().connect(9000, function(){
        this.write("787878,A;##,imei:787878,A;");
        socket.end();
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "We should receive a message", 1000);

    runs(function() {
      expect(tracker.write).toHaveBeenCalled();
      expect(tracker.write.calls.length).toEqual(2);
      expect(tracker.write.calls[0].args[0].type).toEqual("UNKNOWN");
      expect(tracker.write.calls[1].args[0].type).toEqual("CONNECT");
    });
  });

  it("should parse a multi-write valid connection message", function() {
    runs(function() {
      flag = false;
      var socket = new Socket().setNoDelay(true).connect(9000, function(){
        this.write("##,imei:");
        this.write("787878,A;");
        socket.end();
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "We should receive a message", 1000);

    runs(function() {
      expect(tracker.write).toHaveBeenCalled();
      expect(tracker.write.calls.length).toEqual(1);
      expect(tracker.write.calls[0].args[0].type).toEqual("CONNECT");
    });
  });

  it("should parse a valid data message", function() {
    runs(function() {
      flag = false;
      var socket = new Socket().connect(9000, function(){
        this.write("imei:359587010124900,tracker,0809231929,13554900601,F,112909.397,A,2234.4669,N,11354.3287,E,0.11,;");
        socket.end();
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "We should receive a message", 1000);

    runs(function() {
      expect(tracker.write).toHaveBeenCalled();
      expect(tracker.write.calls.length).toEqual(1);
      expect(tracker.write.calls[0].args[0].type).toEqual("DATA");
      expect(tracker.write.calls[0].args[0].speed).toEqual(0.11);
    });
  });
});
