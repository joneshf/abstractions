'use strict';

var either = require('./either');
var Left = either.Left;
var Right = either.Right;
var FreeInstance = require('./free').FreeInstance;
var instances = require('./instances');
var FunctorInstance = instances.FunctorInstance;

// newtype Coproduct f g a = Coproduct (Either (f a) (g a))

function Coproduct(x) {
  if (!(this instanceof Coproduct)) {
    return new Coproduct(x);
  }

  this.runCoproduct = function() {
    return x;
  };
}

FunctorInstance.call(Coproduct.prototype);
FreeInstance.call(Coproduct.prototype);

Coproduct.prototype.map = function(f) {
  return Coproduct(this.runCoproduct()
    .either(R.compose(Left, R.map(f)), R.compose(Right, R.map(f))));
};

function LogHi(next) {
  if (!(this instanceof LogHi)) {
    return new LogHi(next);
  }

  this.runNext = function() {
    return next;
  };
}

FunctorInstance.call(LogHi.prototype);
FreeInstance.call(LogHi.prototype);

LogHi.prototype.map = function(f) {
  return LogHi(f(this.runNext()));
};

function logHi() {
  return LogHi(Unit()).liftF();
}

// LogBye is a thing

function LogBye(next) {
  if (!(this instanceof LogBye)) {
    return new LogBye(next);
  }

  this.runNext = function() {
    return next;
  };
}

FunctorInstance.call(LogBye.prototype);
FreeInstance.call(LogBye.prototype);

LogBye.prototype.map = function(f) {
  var __newVar__20150701033804503188 = this.runNext();
  return LogBye(f(__newVar__20150701033804503188));
};

function logBye() {
  return LogBye(Unit()).liftF();
}

var logScript = logHi().andThen(logBye());
