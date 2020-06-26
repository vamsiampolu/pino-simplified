const { EventEmitter } = require('events');
const format = require('quick-format-unescaped');

const { chindings } = require('./chindings');
const { bindings, level } = require('./formatters');
const { initialLsCache, mappings } = require('./lsCache');
const { err } = require('./serializer');
const { fromEntries, stringify, buildSafeSonicBoom, isHttpRequest, isHttpResponse, isError, isNullOrUndefined, noop } = require('./utils');

class Pino extends EventEmitter {
  constructor() { 
    super();

    this.asJson = this.asJson.bind(this);
    this.asString = this.asString.bind(this);
    this.createLogMethod = this.createLogMethod.bind(this);
    this.createLogMethods = this.createLogMethods.bind(this);
    this.genLog = this.genLog.bind(this);

    this.formatters = {
      bindings: bindings.bind(this), 
      level: level.bind(this),
      log: undefined
    };

    this.hooks = {
      logMethod: undefined 
    }

    this.logByLevel = this.logByLevel.bind(this);
    this.serializers = { 
      err: err.bind(this)
    };

    this.stringify = stringify.bind(this);
    this.time = this.time.bind(this);
    this.write = this.write.bind(this);
 
    this.chindings = chindings;
    this.end = '}\n';
    this.formatOpts = { stringify };
    this.level = 'info';
    this.levels = mappings;
    this.levelVal = this.levels.values[this.level].value;
    this.lsCache = initialLsCache;
    this.messageKey = 'msg';
    this.nestedKey = null;
    this.stringifiers = {};
    this.timeSliceIndex = this.time().indexOf(':') + 1;

    this.stream = buildSafeSonicBoom({ fd: process.stdout.fd, sync: true });
    this.setLevel();
  }

  asString (str) {
    var result = ''
    var last = 0
    var found = false
    var point = 255
    const l = str.length
    if (l > 100) {
      return JSON.stringify(str)
    }
    for (let i = 0; i < l && point >= 32; i++) {
      point = str.charCodeAt(i)
      if (point === 34 || point === 92) {
        result += str.slice(last, i) + '\\'
        last = i
        found = true
      }
    }
    if (!found) {
      result = str
    } else {
      result += str.slice(last)
    }
    return point < 32 ? JSON.stringify(str) : '"' + result + '"'
  }
 
  asJson(obj, msg, num, time) {
    let data = this.lsCache[num] + time + this.chindings;

    if (this.formatters.log) {
      obj = this.formatters.log(obj) 
    }

    if (msg !== undefined) {
      obj[this.messageKey] = msg;
    }

    const notHasOwnProperty = obj.hasOwnProperty === undefined;

    for (let key in obj) {
      let value = obj[key];
      if ((notHasOwnProperty || obj.hasOwnProperty(key)) && value !== undefined) {

        value = this.serializers[key] ? this.serializers[key](value): value; 
	const stringifier = this.stringifiers[key];
        let valueType = typeof value;

        switch(valueType) {
          case 'undefined':
          case 'function':
            continue;
       
         case 'number': {
  	    if (Number.isFinite(value) === false) {
               value = null;	
	    }
	    break;
         }

         case 'boolean': {
           if (stringifier) {
             value = stringifer(value);
           }
           break;
         }

         case 'string': {
           value = (stringifier || this.asString)(value); 
           break;
         }

         default:
	   value = (stringifier || this.stringify)(value);
       }
        if (value === undefined) continue
        data += ',"' + key + '":' + value
      }
    }

    return data + this.end
  }


  createLogMethod ([level, { value } ]) { 
    return [level, hook => this.genLog(value, hook)]; 
  }

  createLogMethods() {
    const isNotFatal = ([level, _])  => level !== 'fatal';
    const { values } = this.levels;
    
   const levelMethods =  fromEntries(
     Object.entries(values)
	   .filter(isNotFatal)
	   .map(this.createLogMethod)
   );

    const hasFlushSync = typeof this.stream.flushSync === 'function';

    levelMethods.fatal = hook => {
      const logFatal = this.genLog(values.fatal, hook); 
      return (...args) => {
        logFatal(...args);  
        if (hasFlushSync) {
          try {  stream.flushSync(); }  catch(e) {}
        }
      }
    };

    return levelMethods;
  }

  genLog(level, hook) {
    const LOG = this.logByLevel(level);

    if (!hook) return LOG;
  
    const  hookWrappedLog = (...args) => { hook(args, LOG); };
    return hookWrappedLog;  
  }

  logByLevel(level) {
    const LOG = (o, ...n) => {
      const isObjectLike = typeof o === 'object';

      if (isObjectLike) {
        let formatParams;
        let msg = isHttpRequest(o) ? mapHttpRequest(o) : (isHttpResponse(o) ? mapHttpResponse(o) : o);

        const hasNoMsgOrParams = msg === null && n.length === 0;

        if (hasNoMsgOrParams) {
         formatParams = [null]; 
        } else {
          const [head, ...rest]  = n;
          msg = head; 
	  formatParams = rest;
        }

        this.write(o, format(msg, formatParams, this.formatOpts), level);
      } else {
        this.write(null, format(o, n, this.formatOpts), level); 
      }
    };

    return LOG;
  }

  setLevel() {
    const { labels, values } = this.levels;
    const hook = this.hooks.logMethod;
    const levelMethods = this.createLogMethods();

    const isAboveDefaultLevel = ([key, { value }]) => this.levelVal > value;
    const isBelowDefaultLevel = ([key, { value }]) => this.levelVal <= value;

    const setNoopLogger = ([key, value]) => [key, noop];
    const setLogger = hook => ([key, value]) => [key, levelMethods[key](hook)]

    const noopLogMethods = fromEntries(
      Object.entries(values)
	    .filter(isAboveDefaultLevel)
	    .map(setNoopLogger)
    );


    const logMethods = fromEntries(
      Object.entries(values)
	    .filter(isBelowDefaultLevel)
	    .map(setLogger(hook))
    );


    Object.assign(this, noopLogMethods, logMethods);
  }


  time() {
    return `,"time":${Date.now()}`
  }

  write(_obj, msg, num) {
    const t = this.time(); 
    const objError = isError(_obj);

    const obj = isNullOrUndefined(_obj) ? {} : Object.assign({}, _obj);

    if (objError && !msg) {
       msg = _obj.message;
    }

    if (objError) {
      obj.stack = _obj.stack; 

      if (!obj.type) {
        obj.type = 'Error'; 
      }
    }

    const s = this.asJson(obj, msg, num, t);
    this.stream.write(s);
  }
}

function pino() {
  return new Pino();
}


module.exports = { Pino, pino }

