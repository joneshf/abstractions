'use strict';

// data Pair a b = Pair a b

function Pair(x, y) {
  if (!(this instanceof Pair)) {
    return new Pair(x, y);
  }

  this.fst = function() {
    return x;
  };

  this.snd = function() {
    return y;
  };

  this.toString = function() {
    return 'Pair(' + this.fst() + ', ' + this.snd() + ')';
  };

  this.map = function(f) {
    return Pair(this.fst(), f(this.snd()));
  };
}

module.exports = {
  Pair: Pair
};
