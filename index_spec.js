var Tk104Stream = require('.').Tk104Stream;
var Tk104Reply = require('.').Tk104Reply;
var Readable = require('stream').Readable;

describe("tracker stream resources", function() {

  describe("tracker stream for message decoding", function() {
    it("should parse a valid connection message", function(done) {
      var tk = new Tk104Stream();
      var s = new Readable();
      s.pipe(tk).on('data', function(message) {
        message = JSON.parse(message);

        expect(message.type).toEqual("CONNECT");
        done();
      });

      s.push("##,imei:787878,A;");
      s.push(null);
    });

    it("should parse a partial valid connection message", function(done) {
      var tk = new Tk104Stream();
      var s = new Readable();
      var i = 0;
      s.pipe(tk).on('data', function(message) {
        message = JSON.parse(message);

        if (i===0) {
          expect(message.type).toEqual("UNKNOWN");
          ++i;
        } else {
          expect(message.type).toEqual("CONNECT");
          done();
        }
      });

      s.push("787878,A;##,imei:787878,A;");
      s.push(null);
    });

    it("should parse a multi-write valid connection message", function(done) {
      var tk = new Tk104Stream();
      var s = new Readable();
      var i = 0;
      s.pipe(tk).on('data', function(message) {
        message = JSON.parse(message);

        expect(message.type).toEqual("CONNECT");
        done();
      });

      s.push("##,imei:");
      s.push("787878,A;");
      s.push(null);
    });

    it("should parse a valid data message", function(done) {
      var tk = new Tk104Stream();
      var s = new Readable();
      var i = 0;
      s.pipe(tk).on('data', function(message) {
        message = JSON.parse(message);

        expect(message.type).toEqual("DATA");
        expect(message.speed).toEqual(0.11);
        done();
      });

      s.push("imei:359587010124900,tracker,0809231929,13554900601,F,112909.397,A,2234.4669,N,11354.3287,E,0.11,;");
      s.push(null);
    });
  });

  describe("tracker stream to reply system", function() {
    it("should reply on connect messages", function(done) {
      var tk = new Tk104Reply();
      var s = new Readable();
      s.pipe(tk).on('data', function(message) {
        expect(message.toString()).toMatch(/LOAD|\*\*,imei/);
        tk.push(null);
        done();
      });

      var message = '{"date":"2016-03-2910:27:50","type":"CONNECT","raw":"##,imei:359586015829802,A;","imei":"359586015829802","coord":false,"speed":false,"message":false}';
      s.push(message);
      s.push(null);
    });

    it("should prepare a valid reply for every 50 meters", function() {
      [
        {in: 50, out: "**,imei:123456,C,0050m"},
        {in: 100, out: "**,imei:123456,C,0100m"},
      ].forEach(function(test) {
        expect(new Tk104Reply().byDistance.every(test.in).meters.replyFor(123456)).toEqual(test.out);
      });
    });

    it("should prepare a valid reply for every x seconds", function() {
      [
        {in: 10, out: "**,imei:123456,C,10s"},
        {in: 7, out: "**,imei:123456,C,07s"},
      ].forEach(function(test) {
        expect(new Tk104Reply().byTime.every(test.in).seconds.replyFor(123456)).toEqual(test.out);
      });
    });

    it("should prepare a valid reply for every x minutes", function() {
      [
        {in: 10, out: "**,imei:123456,C,10m"},
        {in: 4, out: "**,imei:123456,C,04m"},
      ].forEach(function(test) {
        expect(new Tk104Reply().byTime.every(test.in).minutes.replyFor(123456)).toEqual(test.out);
      });
    });
  });
});
