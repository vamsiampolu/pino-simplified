const os = require('os');
const { bindings: formatter } = require('./formatters');
const { stringify }  = require('./utils');

const { pid } = process
const hostname = os.hostname()
const name = undefined;

const chindings = asChindings({ chindings: '' }, { hostname, pid, name })

module.exports = { asChindings, chindings };

function asChindings(instance, bindings) {
  // implementing this can be quite easy.
  const stringifiers = {};
  const serializers = {}

  const invalidKeys = [
    'level',
    'serializers',
    'formatters',
    'customLevels'
  ];


  let data = instance.chindings;
  let value;
  bindings = formatter(bindings);

  for (let key in bindings) {
    value = bindings[key]; 
    const valid = !invalidKeys.includes(key) && bindings.hasOwnProperty(key) &&value !== undefined
    if(valid) {
      value = serializers[key] ? serializers[key](value) : value; 
      value = (stringifiers[key] || stringify)(value)
      if (value === undefined) continue
      data += ',"' + key + '":' + value
    }
  }

  return data;
}

