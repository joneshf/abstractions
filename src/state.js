'use string';

var R = require('ramda');

var instances = require('./instances');
var pair = require('./pair');

// data State s a = State (s -> (a, s))

function State(f) {
  if (!(this instanceof State)) {
    return new State(f);
  }

  this.runState = function(s) {
    return f(s);
  };

  this.execState = function(s) {
    return f(s).snd();
  };

  this.chain = function(f) {
    var self = this;
    return State(function(s) {
      var pair = self.runState(s);
      return f(pair.fst()).runState(pair.snd());
    });
  };
}

State.of = State.prototype.of = function(x) {
  return State(function(s) {
    return pair.Pair(x, s);
  });
};

instances.MonadInstance.call(State.prototype);
instances.MonadInstance.call(State.prototype);

function StateInstance() {
  this.get = function() {
    return State(function(s) {
      return pair.Pair(s, s);
    });
  };
  this.put = function(x) {
    return State(function(s) {
      return pair.Pair(unit.Unit(), s);
    });
  };
  this.modify = function(f) {
    return this.get().chain(R.compose(this.put, f));
  };
}

module.exports = {
  State: State,
  StateInstance: StateInstance,
}
