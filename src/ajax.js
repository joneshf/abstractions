'use strict';

var R = require('ramda');

var CoyonedaInstance = require('./coyoneda').CoyonedaInstance;
var either = require('./either');
var Either = either.Either;
var free = require('./free');
var Free = free.Free;
var FreeInstance = free.FreeInstance;
var FunctorInstance = require('./instances').FunctorInstance;
require('./monkey');

// data AJAX a next = Get URI (a -> next)
//                  | Post URI a next

function AJAX() {
  if (!(this instanceof AJAX)) {
    return new AJAX();
  }

  this.toString = function() {
    return 'AJAX';
  };
}

CoyonedaInstance.call(AJAX.prototype);

function Get(uri, f) {
  if (!(this instanceof Get)) {
    return new Get(uri, f);
  }

  this.uri = function() {
    return uri;
  };

  this.onValue = function() {
    return f;
  };

  this.toString = function() {
    return 'Get(' + this.uri() + ', ' + this.onValue() + ')';
  };

  this.cata = function(obj) {
    return obj.Get(this.uri(), this.onValue());
  };

  this.map = function(f) {
    return Get(this.uri(), R.compose(f, this.onValue()));
  };
}

Get.prototype = AJAX();
FreeInstance.call(Get.prototype);
FunctorInstance.call(Get.prototype);

function get(uri) {
  return Get(uri, R.identity).liftF();
}

function User(id, name) {
  if (!(this instanceof User)) {
    return new User(id, name);
  }

  this.id = function() {
    return id;
  };

  this.name = function() {
    return name;
  };
}

var api = {
  '/users': [User(1, 'John'), User(2, 'Jan'), User(3, 'Jen')]
};

// ajaxArray :: AJAX ~> []
function ajaxArray(ajax) {
  return ajax.cata({
    Get: function(uri, f) {
      return [f(uri)];
    }
  });
}

function ajaxE(ajax) {
  return ajax.cata({
    Get: function(uri, f) {
      return api.hasOwnProperty(uri) ?
        either.Right(f(uri)) :
        either.Left('404 ' + uri);
    }
  });
}

function ajaxArrayString(api, free) {
  function go(free, arr) {
    return free.resume().either(function(ajax) {
      return ajax.cata({
        Get: function(uri, f) {
          return go(f(api[uri]), arr.concat('GET ' + uri));
        }
      });
    }, R.flip(R.append)(arr));
  }

  return go(free, []);
}

function ajaxEither(api, free) {
  return free.resume().either(function(ajax) {
    return ajax.cata({
      Get: function(uri, f) {
        if (api.hasOwnProperty(uri)) {
          return either.Right(ajaxEither(api, f(api[uri])));
        } else {
          return either.Left('404 ' + uri);
        }
      }
    });
  }, R.identity);
}

var script = get('/users').chain(function(users) {
  if (users.length === 0) {
    return Free.of('No users!');
  } else {
    return Free.of('Found ' + users.length + ' users');
  }
});

var badURI = get('/users')
  .andThen(get('/user/20'))
  .andThen(get('/users'));

console.log('%s', ajaxArrayString(api, script).join('\n'));
console.log('%s', ajaxArrayString(api, get('/users')).join('\n'));
console.log();
console.log('%s', ajaxEither(api, script));
console.log('%s', ajaxEither(api, get('/user/1')));
console.log('%s', ajaxEither(api, badURI));
console.log();
console.log('%s', ajaxArrayString(api, badURI));

console.log();
console.log('%s', script.foldMap(Array, ajaxArray).join('\n'));
console.log('%s', badURI.foldMap(Array, ajaxArray).join('\n'));

console.log();
console.log('%s', script.foldMap(Either, ajaxE));
console.log('%s', badURI.foldMap(Either, ajaxE));
