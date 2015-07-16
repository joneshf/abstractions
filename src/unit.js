// data Unit = Unit

function Unit() {
  if (!(this instanceof Unit)) {
    return new Unit();
  }
}

Unit.prototype.toString = function() {
  return 'Unit';
};

module.exports = {
  Unit: Unit,
};
