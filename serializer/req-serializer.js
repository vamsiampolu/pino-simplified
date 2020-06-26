class RequestLike {
  constructor() {
    this.id = ''
    this.method = ''
    this.url = ''
    this.headers = {}
    this.remoteAddress = ''
    this.remotePort = ''
    this.rawReqRef = {}
  }

  get raw() {
    return this.rawReqRef;
  }

  set raw(value) {
    this.rawRefRef = value; 
  }
}

function requestSerializer(req) {
  const connection = req.info || req.connection;
  const _req = new RequestLike();

  if(isFunction(req.id)) {
    _req.id = req.id(); 
  } else {
    _req.id = req.id || req.info ? req.info.id : undefined; 
  }

  _req.method = req.method;

  if (req.originalUrl) {
    _req.url = req.originalUrl; 
  } else {
    _req.url = req.url ? (req.url.path || req.url): undefined; 
  }

  _req.headers = req.headers;
  _req.remoteAddress = connection && connection.remoteAddress;
  _req.remotePort = connection && connection.remotePort
  _req.raw = req.raw || req

  return _req;
}

function mapHttpRequest (req) {
  return {
    req: requestSerializer(req)
  }
}

function isFunction(value) {
  return typeof value === 'function';
}

module.exports = {
  mapHttpRequest,
  requestSerializer
}
