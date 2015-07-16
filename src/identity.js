'use strict';

var FreeInstance = require('./free').FreeInstance;
var instances = require('./instances');
var FunctorInstance = instances.FunctorInstance;

// data Identity a = Identity a

function Identity(x) {
  if (!(this instanceof Identity)) {
    return new Identity(x);
  }

  this.runIdentity = function() {
    return x;
  };

  this.toString = function() {
    return 'Identity(' + this.runIdentity() + ')';
  };

  this.map = function(f) {
    return Identity(f(this.runIdentity()));
  };
}

FreeInstance.call(Identity.prototype);
FunctorInstance.call(Identity.prototype);
