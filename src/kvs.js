'use strict';

require('./monkey');

var R = require('ramda');

var FreeInstance = require('./free').FreeInstance;
var instances = require('./instances');
var FunctorInstance = instances.FunctorInstance;

var Unit = require('./unit').Unit;

// data KVS a = Put String String a | Del String a | Get String (String -> a)

function KVS() {
  if (!(this instanceof KVS)) {
    return new KVS();
  }

  this.toString = function() {
    return 'KVS';
  };
};

FunctorInstance.call(KVS.prototype);
FreeInstance.call(KVS.prototype);

function Put(key, val, next) {
  if (!(this instanceof Put)) {
    return new Put(key, val, next);
  }

  this.runKey = function() {
    return key;
  };

  this.runVal = function() {
    return val;
  };

  this.runNext = function() {
    return next;
  };

  this.toString = function() {
    return 'Put(' + this.runKey() + ', ' + this.runVal() + ')';
  };

  this.map = function(f) {
    return Put(this.runKey(), this.runVal(), f(this.runNext()));
  };

  this.cata = function(obj) {
    return obj.Put(this.runKey(), this.runVal(), this.runNext());
  };
};

Put.prototype = new KVS();

function Del(key, next) {
  if (!(this instanceof Del)) {
    return new Del(key, next);
  }

  this.runKey = function() {
    return key;
  };

  this.runNext = function() {
    return next;
  };

  this.toString = function() {
    return 'Del(' + this.runKey() + ')';
  };

  this.map = function(f) {
    return Del(this.runKey(), f(this.runNext()));
  };

  this.cata = function(obj) {
    return obj.Del(this.runKey(), this.runNext());
  };
}

Del.prototype = new KVS();

function Get(key, onValue) {
  if (!(this instanceof Get)) {
    return new Get(key, onValue);
  }

  this.runKey = function() {
    return key;
  };

  this.runOnValue = function() {
    return onValue;
  };

  this.toString = function() {
    return 'Get(' + this.runKey() + ')';
  };

  this.map = function(f) {
    return Get(this.runKey(), this.runOnValue().map(f));
  };

  this.cata = function(obj) {
    return obj.Get(this.runKey(), this.runOnValue());
  };
}

Get.prototype = new KVS();

function put(key, val) {
  return Put(key, val, Unit()).liftF();
}

function del(key) {
  return Del(key, Unit()).liftF();
}

function get(key) {
  return Get(key, R.identity).liftF();
}

function modify(key, f) {
  return get(key).chain(function(v) {
    return put(key, f(v));
  });
}

function interpretStr(free, store) {
  function go(store, free, strs) {
    return free.resume().either(function(kvs) {
      return kvs.cata({
        Put: function(key, val, next) {
          return go(R.assoc(key, val, store), next, strs.concat('Putting ' + key + ' with ' + val));
        },
        Del: function(key, next) {
          return go(R.dissoc(key, store), next, strs.concat('Deleting ' + key));
        },
        Get: function(key, f) {
          return go(store, f(store[key]), strs.concat('Getting ' + key));
        }
      });
    }, R.always(strs.join('\n')));
  };

  return go(store, free, []);
}

function interpretPure(free, store) {
  return free.resume().either(function(kvs) {
    return kvs.cata({
      Put: function(key, val, next) {
        return interpretPure(next, R.assoc(key, val, store));
      },
      Del: function(key, next) {
        return interpretPure(next, R.dissoc(key, store));
      },
      Get: function(key, f) {
        return interpretPure(f(store[key]), store);
      }
    });
  }, R.always(store));
}

var script = get('swiss bank account id').chain(function(id) {
  return modify(id, R.add(1000000))
    .andThen(put('bermuda airport', 'getaway car'))
    .andThen(del('tax records'));
});

var store = {
  'swiss bank account id': 1234,
  1234: 5032.12,
  'tax records': [
    {date: '2/20/14', subject: 'Arco', amount: '-37.52'},
    {date: '2/23/14', subject: 'Taco Bell', amount: '-7.11'},
    {date: '2/24/14', subject: 'Chase', amount: '2322.90'}
  ],
};

console.log(interpretStr(script, store));
console.log(interpretPure(script, store));

