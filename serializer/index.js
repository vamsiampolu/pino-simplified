const { requestSerializer: req, mapHttpRequest } = require('./req-serializer');
const { responseSerializer: res, mapHttpResponse } = require('./res-serializer');
const err = require('./error-serializer'); 

module.exports = {
  err, 
  req,
  res,
  mapHttpRequest,
  mapHttpResponse
};

