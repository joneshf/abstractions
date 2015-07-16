'use strict';

var R = require('ramda');

var free = require('./free');
var unit = require('./unit');

// data Forth a = Push Int a
//              | Pop a
//              | Dup a
//              | Swap a
//              | Rot a

function Forth() {
  if (!(this instanceof Forth)) {
    return new Forth();
  }

  this.toString = function() {
    return 'Forth';
  };
}

free.FreeInstance.call(Forth.prototype);

function Push(x, next) {
  if (!(this instanceof Push)) {
    return new Push(x, next);
  }

  Forth.call(this);

  this.val = function() {
    return x;
  };

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Push(' + this.val() + ', ' + this.next() + ')';
  };

  this.map = function(f) {
    return Push(this.val(), f(this.next()));
  };

  this.cata = function(obj) {
    return obj.Push(this.val(), this.next());
  };
}

Push.prototype = Object.create(Forth.prototype);
Push.prototype.constructor = Push;

function Pop(next) {
  if (!(this instanceof Pop)) {
    return new Pop(next);
  }

  Forth.call(this);

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Pop(' + this.next() + ')';
  };

  this.map = function(f) {
    return Pop(f(this.next()));
  };

  this.cata = function(obj) {
    return obj.Pop(this.next());
  };
}

Pop.prototype = Object.create(Forth.prototype);
Pop.prototype.constructor = Pop;

// push :: Free Forth ()
function push(x) {
  return Push(x, unit.Unit()).liftF();
}
// pop :: Free Forth Int
function pop() {
  return Pop(unit.Unit()).liftF();
}

var script = push(2)
  .andThen(push(3))
  .andThen(push(4))
  .andThen(pop())
  .andThen(push(5));

// forthArray :: Forth a -> Array a
function forthArray(forth) {
  return forth.cata({
    Push: function(_, next) {
      return [next];
    },
    Pop: function(next) {
      return [next];
    }
  });
}
