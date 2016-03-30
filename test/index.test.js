'use strict';

const PacketParser = require('..');
const PassThrough = require('stream').PassThrough;
require('should');

describe('test/index.test.js', function() {
  it('should work', function() {
    const stream = new PassThrough();
    const buf = new Buffer(100);
    buf[0] = 96;

    const parser = new PacketParser(stream, [
      {
        name: 'head',
        length: 4,
      },
      {
        name: 'body',
        length: function(packet) {
          return packet.head[0];
        },
      },
    ]);
    let times = 0;
    parser.on('packet', function(packet) {
      times++;
      console.log(packet.head, packet.body);
    });

    for (let i = 0; i < 10; ++i) {
      stream.write(buf);
    }
    times.should.equal(10);
  });
});
