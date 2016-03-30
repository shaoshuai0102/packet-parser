'use strict';

const EventEmitter = require('events');
const assert = require('assert');
const Readable = require('stream').Readable;

class PacketParser extends EventEmitter {
  constructor(stream, fieldsDesc) {
    assert(stream instanceof Readable, 'stream must be a stream.Writable instance');
    assert(fieldsDesc instanceof Array, 'fieldsDesc must be an array');

    super();

    this._stream = stream;
    this._fieldsDesc = fieldsDesc;
    this._cur = 0;
    this._packet = {};

    stream.on('readable', this._handleReadable.bind(this));
  }

  _handleReadable() {
    const curField = this._fieldsDesc[this._cur];

    let length = curField.length;
    if (typeof length === 'function') {
      length = length(this._packet);
    }

    const buf = this._stream.read(length);

    // buffer 被读空了，或者 buffer 中的内容不够本次长度要求，等待下一次 readable
    if (!buf) return;

    this._packet[curField.name] = buf;
    this._cur++;

    if (this._cur === this._fieldsDesc.length) {
      this.emit('packet', this._packet);
      this._packet = {};
      this._cur = 0;
    }

    // 继续读取
    this._handleReadable();
  }
}

module.exports = PacketParser;
