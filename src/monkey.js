'use strict';

var R = require('ramda');

var Either = require('./either').Either;
var FreeInstance = require('./free').FreeInstance;
var instances = require('./instances');
var FunctorInstance = instances.FunctorInstance;

// Open objects

Array.prototype.chain = function(f) {
  return this.map(f).reduce(function(acc, x) { return acc.concat(x); }, []);
};

Array.of = function(x) {
  return [x];
};

Function.prototype.map = function(f) {
  return R.compose(f, this);
};

FunctorInstance.call(Function.prototype);
FreeInstance.call(Function.prototype);

FreeInstance.call(Either.prototype);
