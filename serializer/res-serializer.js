module.exports = {
  responseSerializer,
  mapHttpResponse
};

class ResponseLike {
  constructor() {
    this.statusCode = 0
    this.headers = ''
    this.rawResRef = {}
  }

  get raw() {
    return this.rawResRef; 
  }
  set raw(value) {
    this.rawResRef = value; 
  }
}


function responseSerializer(res) {
  const _res = new ResponseLike();
   _res.statusCode = res.statusCode
  _res.headers = res.getHeaders ? res.getHeaders() : res._headers
  _res.raw = res
  return _res
}

function mapHttpResponse(res) {
  return {
    res: responseSerializer(res)
  };
}
