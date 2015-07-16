'use strict';

var R = require('ramda');

var instances = require('./instances');
var pair = require('./pair');
// Inheritance

function FunctorInstance() {
  this.mapK = function(x) {
    return this.map(R.always(x));
  };
  this.iter = function(f, free) {
    var self = this;
    return this.cata({
      Of: R.identity,
      Join: function(cheap) {
        return f(cheap.map(function(free_) {
          return self.iter(f, free_);
        }));
      }
    });
  };
  this.foldRun = function(x, f) {
    function go(x, free) {
      return free.resume().either(
        function(y) {
          var z = f(x, y);
          return go(z.fst(), z.snd());
        },
        function(y) {
          return pair.Pair(x, y);
        }
      );
    }

    return go(x, this);
  };
}

function ApplyInstance() {
  FunctorInstance.call(this);
}

function ApplicativeInstance() {
  ApplyInstance.call(this);

  this.map = function(f) {
    return this.of(f).ap(this);
  };
}

function ChainInstance() {
  ApplyInstance.call(this);

  this.ap = function(x) {
    return this.chain(x.map);
  };

  this.andThen = function(x) {
    return this.chain(R.always(x));
  };
}

function MonadInstance() {
  ApplicativeInstance.call(this);
  ChainInstance.call(this);

  this.map = function(f) {
    return this.chain(R.compose(this.of, f));
  };
}

module.exports = {
  ApplicativeInstance: ApplicativeInstance,
  ApplyInstance: ApplyInstance,
  ChainInstance: ChainInstance,
  FunctorInstance: FunctorInstance,
  MonadInstance: MonadInstance,
}
