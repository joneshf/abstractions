'use strict';

var MonadInstance = require('./instances').MonadInstance;

// data Either a b = Left a | Right b

function Either() {
  if (!(this instanceof Either)) {
    return new Either();
  }

  this.either = function(f, g) {
    return this.cata({Left: f, Right: g});
  };
}

Either.of = Either.prototype.of = Right;

MonadInstance.call(Either.prototype);

function Left(x) {
  if (!(this instanceof Left)) {
    return new Left(x);
  }

  this.runLeft = function() {
    return x;
  };

  this.toString = function() {
    return 'Left(' + this.runLeft() + ')';
  };

  this.cata = function(obj) {
    return obj.Left(this.runLeft());
  };

  this.chain = function(_) {
    return Left(this.runLeft());
  };
}

Left.prototype = Either();

function Right(x) {
  if (!(this instanceof Right)) {
    return new Right(x);
  }

  this.runRight = function() {
    return x;
  };

  this.toString = function() {
    return 'Right(' + this.runRight() + ')';
  };

  this.cata = function(obj) {
    return obj.Right(this.runRight());
  };

  this.chain = function(f) {
    return f(this.runRight());
  };
}

Right.prototype = Either();

module.exports = {
  Either: Either,
  Left: Left,
  Right: Right,
};
