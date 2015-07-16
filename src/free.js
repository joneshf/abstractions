'use strict';

var R = require('ramda');

var CoyonedaInstance = require('./coyoneda').CoyonedaInstance;
var either = require('./either');
var Left = either.Left;
var Right = either.Right;
var MonadInstance = require('./instances').MonadInstance;

// data Free f a = Of a
//               | Join (f (Free f a))
//               | forall b. Chain (Free f a) (a -> Free f b)

function Free() {
  if (!(this instanceof Free)) {
    return new Free();
  }

  this.chain = function(f) {
    return Chain(this, f);
  };

  this.fold = function(f, g) {
    return this.resume().either(g, f);
  };

  this.step = function() {
    return this.cata({
      Chain: function(x, f) {
        return x.cata({
          Chain: function(y, g) {
            return y.chain(function(z) {
              return g(z).chain(f);
            }).step();
          },
          Of: function(x) {
            return f(x).step();
          },
          Join: Join
        });
      },
      Of: Of,
      Join: Join,
    });
  };

  this.foldMap = function(m, f) {
    return this.step().cata({
      Of: m.of,
      Join: f,
      Chain: function(x, g) {
        return x.foldMap(m, f).chain(function(y) {
          return g(y).foldMap(m, f);
        });
      }
    });
  };
}

Free.prototype.of = Free.of = Of;

MonadInstance.call(Free.prototype);
FreeInstance.call(Free.prototype);

function Of(x) {
  if (!(this instanceof Of)) {
    return new Of(x);
  }

  Free.call(this);

  this.runOf = function() {
    return x;
  };

  this.toString = function() {
    return 'Of(' + this.runOf() + ')';
  };

  this.cata = function(obj) {
    return obj.Of(this.runOf());
  };

  this.resume = function() {
    return Right(this.runOf());
  };
}

Of.prototype = Object.create(Free.prototype);
Of.prototype.constructor = Of;

function Join(x) {
  if (!(this instanceof Join)) {
    return new Join(x);
  }

  Free.call(this);

  this.runJoin = function() {
    return x;
  };

  this.toString = function() {
    return 'Join(' + this.runJoin().map(R.toString) + ')';
  };

  this.cata = function(obj) {
    return obj.Join(this.runJoin());
  };

  this.resume = function() {
    return Left(this.runJoin().map(Of));
  };
}

Join.prototype = Object.create(Free.prototype);
Join.prototype.constructor = Join;

function Chain(x, f) {
  if (!(this instanceof Chain)) {
    return new Chain(x, f);
  }

  Free.call(this);

  this.runFree = function() {
    return x;
  };

  this.runChain = function() {
    return f;
  };

  this.toString = function() {
    return 'Chain(' + this.runFree() + ', f)';
  };

  this.cata = function(obj) {
    return obj.Chain(this.runFree(), this.runChain());
  };

  this.resume = function() {
    var f = this.runChain();
    return this.runFree().cata({
      Of: function(x) {
        return f(x).resume();
      },
      Join: function(x) {
        return Left(x.map(f));
      },
      Chain: function(x, g) {
        return x.chain(function(y) {
          return g(y).chain(f);
        }).resume();
      }
    });
  };
}

Chain.prototype = Object.create(Free.prototype);
Chain.prototype.constructor = Chain;

function FreeInstance() {
  CoyonedaInstance.call(this);
  this.liftF = function() {
    return Join(this.map(Of));
  };
  this.liftFC = function() {
    return Join(this.liftCoyoneda().map(Of));
  };
  this.runFC = function(m, f) {
    return this.foldMap(m, function(coyo) {
      return f(coyo.value()).map(coyo.fun());
    });
  };
}

module.exports = {
  Free: Free,
  FreeInstance: FreeInstance,
  Of: Of,
  Join: Join,
  Chain: Chain,
};
