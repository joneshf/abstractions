'use strict';

var FreeInstance = require('./free').FreeInstance;
var instances = require('./instances');
var FunctorInstance = instances.FunctorInstance;

// type UserId = Int
// type UserName = String
// type UserPhoto = String

// data Tweet = Tweet UserId String

function Tweet(id, str) {
  if (!(this instanceof Tweet)) {
    return new Tweet(id, str);
  }

  this.userId = function() {
    return id;
  }
  this.msg = function() {
    return str;
  }
}

// data User = User UserId UserName UserPhoto

function User(id, name, photo) {
  if (!(this instanceof User)) {
    return new User(id, name, photo);
  }

  this.id = function() {
    return id;
  }
  this.name = function() {
    return name;
  }
  this.photo = function() {
    return photo;
  }
}

// data Service a where
//    GetTweets :: UserId -> Service [Tweet]
//    GetUserName :: UserId -> Service UserName
//    GetUserPhoto :: UserId -> Service UserPhoto

function Service() {
  if (!(this instanceof Service)) {
    return new Service();
  }

  this.toString = function() {
    return 'Service';
  };

  this.map = function(_) {
    return this;
  };
};

FreeInstance.call(Service.prototype);
FunctorInstance.call(Service.prototype);

function GetTweets(id) {
  if (!(this instanceof GetTweets)) {
    return new GetTweets(id);
  }

  this.userId = function() {
    return id;
  };

  this.toString = function() {
    return 'GetTweets(' + this.userId() + ')';
  };

  this.cata = function(obj) {
    return obj.GetTweets(this.userId());
  };
}

GetTweets.prototype = Service();

function GetUserName(id) {
  if (!(this instanceof GetUserName)) {
    return new GetUserName(id);
  }

  this.userId = function() {
    return id;
  };

  this.toString = function() {
    return 'GetUserName(' + this.userId() + ')';
  };

  this.cata = function(obj) {
    return obj.GetUserName(this.userId());
  };
}

GetUserName.prototype = Service();

function GetUserPhoto(id) {
  if (!(this instanceof GetUserPhoto)) {
    return new GetUserPhoto(id);
  }

  this.userId = function() {
    return id;
  };

  this.toString = function() {
    return 'GetUserPhoto(' + this.userId() + ')';
  };

  this.cata = function(obj) {
    return obj.GetUserPhoto(this.userId());
  };
}

GetUserPhoto.prototype = Service();

// data Request a = Pure a
//                | Fetch (Service a)

function Request() {
  if (!(this instanceof Request)) {
    return new Request();
  }

  this.toString = function() {
    return 'Request';
  };
};

FreeInstance.call(Service.prototype);
FunctorInstance.call(Service.prototype);

function Pure(x) {
  if (!(this instanceof Pure)) {
    return new Pure(x);
  }

  this.runPure = function() {
    return x;
  };

  this.toString = function() {
    return 'Pure(' + this.runPure() + ')';
  };

  this.map = function(f) {
    return Pure(f(this.runPure()));
  };

  this.cata = function(obj) {
    return obj.Pure(this.runPure());
  };
}

Pure.prototype = Request();

function Fetch(x) {
  if (!(this instanceof Fetch)) {
    return new Fetch(x);
  }

  this.service = function() {
    return x;
  };

  this.toString = function() {
    return 'Fetch(' + this.service() + ')';
  };

  this.map = function(f) {
    return Fetch(this.service().map(f));
  };

  this.cata = function(obj) {
    return obj.Fetch(this.service());
  };
}

Fetch.prototype = Request();

function pure(x) {
  return Pure(x).liftF();
}

function fetch(svc) {
  return Fetch(svc).liftF();
}

function toyInterpreter(req) {
  return req.cata({
    Pure: function(x) {
      return x;
    },
    Fetch: function(svc) {
      return svc.cata({
        GetTweets: function(id) {
          console.log('Getting tweets for user', id.toString());
          return [Tweet(1, 'Hi'), Tweet(2, 'Hi'), Tweet(3, 'Bye')];
        },
        GetUserName: function(id) {
          console.log('Getting tweets for user', id.toString());
          return id === 1 ? 'Agnes'
            : id === 2 ? 'Brian'
            : 'Anonymous';
        },
        GetUserPhoto: function(id) {
          console.log('Getting tweets for user', id.toString());
          return id === 1 ? ':-)'
            : id === 2 ? ':-D'
            : ':-|';
        }
      });
    }
  });
}

var theId = 1

function getUser(id) {
  return fetch(GetUserName(id)).chain(function(name) {
    return fetch(GetUserPhoto(id)).map(function(photo) {
      return User(id, name, photo);
    });
  });
}

var free = fetch(GetTweets(theId)).chain(function(tweets) {
  return tweets.map(function(tweet) {
    return getUser(tweet.userId()).chain(function(user) {
      var result = {};
      result[tweet.msg] = user;
      return result;
    });
  }).sequence();
});

function run() {
  return free.runFC(toyInterpreter);
}
