const { isError } = require('../utils');

const seenProp = 'circularRefTag';

class ErrorLike {
  constructor() {
     
  this.type = undefined
  this.message = undefined
  this.stack = undefined
  this.rawErrRef =  {}
  }
  
  get raw() {
    return this.rawErrRef;  
  }

  set raw(value) {
    this.rawErrRef = value; 
  }
}


function errorSerializer(err) {
  if (!isError(err)) {
    return err; 
  }

  // tag to prevent re-looking at this
  err[seenProp] = undefined;

  const _err = new ErrorLike();

  _err.type = err.constructor.name;
  _err.message = err.message;
  _err.stack = err.stack;

  for (const key in err) {
    const value = err[key];
    if(isError(value)) {
      if(!value.hasOwnProperty(seenProp)) {
        _err[key] = errorSerializer(value);  
      }
    } else {
      _err[key] = value;
    }
  }

  delete err[seenProp];
  _err.raw = err;
  return _err;
}


module.exports = errorSerializer;
