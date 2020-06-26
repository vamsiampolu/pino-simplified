const { level: formatter } = require('./formatters');
const { flip, fromEntries, mapValues, reverseTuple2 } = require('./utils');

const levels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
}

const nums = flip(levels);
const initialLsCache = mapValues(nums, numToLevel);

const mappingLabels = fromEntries(Object.entries(nums).map(toMapping));
const mappingValues = fromEntries(Object.entries(levels).map(toMapping));

const mappings = {
  labels: Object.assign({}, { Infinity: { value: 'silent' } }, mappingLabels),
  values: Object.assign({}, { silent: { value: Infinity } }, mappingValues)
};

module.exports = {
  genLsCache,
  getLevelVal,
  initialLsCache,
  levels,
  mappings
};

function genLsCache(instance) {
 const cache = {};
  for (const label in nums) {
    const level = formatter(nums[label], Number(label));
    cache[label] = JSON.stringify(level).slice(0, -1);
  }
  instance.lsCache = cache; 
  return instance;
}

function numToLevel(num) {
  const level = '"level"';
  return [num, `{${level}:${num}`]
}


function toMapping(entry) {
  const [key, value] = entry;
  return [key, { value } ];
}



function getLevelVal(level) {
  return mappings.values[level].value;
}
