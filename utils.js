
const safe = require('fast-safe-stringify');
const SonicBoom = require('sonic-boom');

function buildSafeSonicBoom(opts) {
  const stream = new SonicBoom(opts);
  const errorHandler = getErrorHandler(stream);
  stream.on('error', errorHandler);
  return stream;
}

function fromEntries (arr) {
  return arr.reduce((obj, [key, val]) => ({ 
    ...obj,
    [key]: val
  }), {});
}

function getErrorHandler(stream) {
  return function filterBrokenPipe(err) {
    if (isBrokenPipe(err)) {
      stream.write = noop; 
      stream.end = noop;
      stream.flushSync = noop;
      stream.destroy = noop;
      return;
    }
    stream.removeListener('error', filterBrokenPipe)
    stream.emit('error', err)
  }
}

function flip(obj) {
  return fromEntries(
    Object.entries(obj)
      .map(reverseTuple2)
  );
}

function mapValues(obj, fn) {
  return fromEntries(
    Object.keys(obj)
      .map(fn)
  );
}

function reverseTuple2([a, b]) {
  return [b, a];
}

function stringify(obj) {
  try {
    return JSON.stringify(obj); 
  } catch(_) {
    return safe(obj); 
  }
}


function isError(err) {
  return err instanceof Error
}

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}


function isBrokenPipe(err) {
  return err.code === 'EPIPE';
}

function isHttpRequest(o) {
  return o !== null && o.method && o.headers && o.socket;
}

function isHttpResponse(o) {
  return o !== null && typeof o.setHeader === 'function';
}


function noop() {}

module.exports = { 
  buildSafeSonicBoom,
  flip,
  fromEntries,
  isError,
  isBrokenPipe,
  isHttpRequest,
  isHttpResponse,
  isNullOrUndefined,
  mapValues,
  noop,
  reverseTuple2,
  stringify,
};
