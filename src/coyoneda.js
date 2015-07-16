'use strict';

var R = require('ramda');

var FunctorInstance = require('./instances').FunctorInstance;

// data Coyoneda f a = Coyoneda (b -> a) (f b)

function Coyoneda(f, x) {
  if (!(this instanceof Coyoneda)) {
    return new Coyoneda(f, x);
  }

  this.fun = function() {
    return f;
  };

  this.value = function() {
    return x;
  };

  this.map = function(f) {
    return Coyoneda(R.compose(f, this.fun()), this.value());
  };
}

FunctorInstance.call(Coyoneda.prototype);

function CoyonedaInstance() {
  this.liftCoyoneda = function() {
    return Coyoneda(R.identity, this);
  };
}

module.exports = {
  Coyoneda: Coyoneda,
  CoyonedaInstance: CoyonedaInstance,
};
