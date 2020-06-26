module.exports = {
  bindings,
  level
};

function bindings(x) { return x }

function level(label, number) {
  return {
    level: number 
  };
}
