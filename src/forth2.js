'use strict';

var R = require('ramda');

var free = require('./free');
var instances = require('./instances');
var pair = require('./pair');
var state = require('./state');
var unit = require('./unit');

// data Forth a = Push Int a
//              | Add a
//              | Mul a
//              | Dup a
//              | End a

function Forth() {
  if (!(this instanceof Forth)) {
    return new Forth();
  }

  this.toString = function() {
    return 'Forth';
  };
}

free.FreeInstance.call(Forth.prototype);
instances.FunctorInstance.call(Forth.prototype);

function Push(x, next) {
  if (!(this instanceof Push)) {
    return new Push(x, next);
  }

  Forth.call(this);

  this.value = function() {
    return x;
  };

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Push(' + this.value() + ', ' + this.next() + ')';
  };

  // this.map = function(f) {
  //   return Push(this.value(), f(this.next()));
  // };

  this.cata = function(obj) {
    return obj.Push(this.value(), this.next());
  };
}

Push.prototype = Object.create(Forth.prototype);
Push.prototype.constructor = Push;

function Add(next) {
  if (!(this instanceof Add)) {
    return new Add(next);
  }

  Forth.call(this);

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Add(' + this.next() + ')';
  };

  // this.map = function(f) {
  //   return Add(f(this.next()));
  // };

  this.cata = function(obj) {
    return obj.Add(this.next());
  };
}

Add.prototype = Object.create(Forth.prototype);
Add.prototype.constructor = Add;

function Mul(next) {
  if (!(this instanceof Mul)) {
    return new Mul(next);
  }

  Forth.call(this);

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Mul(' + this.next() + ')';
  };

  // this.map = function(f) {
  //   return Mul(f(this.next()));
  // };

  this.cata = function(obj) {
    return obj.Mul(this.next());
  };
}

Mul.prototype = Object.create(Forth.prototype);
Mul.prototype.constructor = Mul;

function Dup(next) {
  if (!(this instanceof Dup)) {
    return new Dup(next);
  }

  Forth.call(this);

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'Dup(' + this.next() + ')';
  };

  // this.map = function(f) {
  //   return Dup(f(this.next()));
  // };

  this.cata = function(obj) {
    return obj.Dup(this.next());
  };
}

Dup.prototype = Object.create(Forth.prototype);
Dup.prototype.constructor = Dup;

function End(next) {
  if (!(this instanceof End)) {
    return new End(next);
  }

  Forth.call(this);

  this.next = function() {
    return next;
  };

  this.toString = function() {
    return 'End(' + this.next() + ')';
  };

  // this.map = function(f) {
  //   return End(f(this.next()));
  // };

  this.cata = function(obj) {
    return obj.End(this.next());
  };
}

End.prototype = Object.create(Forth.prototype);
End.prototype.constructor = End;

// type ForthProg a = Free Forth a

// push :: Int -> ForthProg Unit
function push(val) {
  return Push(val, unit.Unit()).liftFC();
}

// add, mul, dup, end :: ForthProg Unit
var add = Add(unit.Unit()).liftFC();
var mul = Mul(unit.Unit()).liftFC();
var dup = Dup(unit.Unit()).liftFC();
var end = End(unit.Unit()).liftFC();

// testProg :: ForthProg Unit
var testProg = push(3)
  .andThen(push(6))
  .andThen(add)
  .andThen(push(7))
  .andThen(push(2))
  .andThen(add)
  .andThen(mul)
  .andThen(dup)
  .andThen(add);

// square :: ForthProg Unit
var square = dup.andThen(mul);

// testProg2 :: ForthProg Unit
var testProg2 = push(3)
  .andThen(square)
  .andThen(push(4))
  .andThen(square)
  .andThen(add);

// runProgram :: Array Int -> ForthProg Unit -> Array Int
// function runProgram(stack, program) {
//   return program.fold(
//     R.always(stack),
//     function(forth) {
//       return forth.cata({
//         Push: function(value, next) {
//           return runProgram(R.prepend(value, stack), next);
//         },
//         Add: function(next) {
//           var x = stack[0];
//           var y = stack[1];
//           var zs = stack.slice(2);
//           return runProgram(R.prepend(x + y, zs), next);
//         },
//         Mul: function(next) {
//           var x = stack[0];
//           var y = stack[1];
//           var zs = stack.slice(2);
//           return runProgram(R.prepend(x * y, zs), next);
//         },
//         Dup: function(next) {
//           var x = stack[0];
//           return runProgram(R.prepend(x, stack), next);
//         },
//         End: function(next) {
//           return stack;
//         },
//       });
//     }
//   );
// }

// console.log(JSON.stringify(runProgram([], testProg)));
// console.log(JSON.stringify(runProgram([], testProg2)));

// // runFn :: Array Int -> Forth (ForthProg Unit)
// //       -> Pair(Array Int, ForthProg Unit)
// function runFn(stack, program) {
//   return program.cata({
//     Push: function(value, next) {
//       return pair.Pair(R.prepend(value, stack), next);
//     },
//     Add: function(next) {
//       var x = stack[0];
//       var y = stack[1];
//       var zs = stack.slice(2);
//       return pair.Pair(R.prepend(x + y, zs), next);
//     },
//     Mul: function(next) {
//       var x = stack[0];
//       var y = stack[1];
//       var zs = stack.slice(2);
//       return pair.Pair(R.prepend(x * y, zs), next);
//     },
//     Dup: function(next) {
//       var x = stack[0];
//       return pair.Pair(R.prepend(x, stack), next);
//     },
//     End: function(next) {
//       return pair.Pair(stack, Of());
//     },
//   });
// }

// console.log('%s', testProg.foldRun([], runFn));

// type Stack = Array Int
// type StackState a = State Stack a

// runStack :: Forth ~> StackState
function runStack(forth) {
  return forth.cata({
    Push: function(value, next) {
      return state.State(function(stack) {
        return pair.Pair(next, R.prepend(value, stack));
      });
    },
    Add: function(next) {
      return state.State(function(stack) {
        var x = stack[0];
        var y = stack[1];
        var zs = stack.slice(2);
        return pair.Pair(next, R.prepend(x + y, zs));
      });
    },
    Mul: function(next) {
      return state.State(function(stack) {
        var x = stack[0];
        var y = stack[1];
        var zs = stack.slice(2);
        return pair.Pair(next, R.prepend(x * y, zs));
      });
    },
    Dup: function(next) {
      return state.State(function(stack) {
        var x = stack[0];
        return pair.Pair(next, R.prepend(x, stack));
      });
    },
    End: function(next) {
      return state.State(function(stack) {
        return pair.Pair(next, stack);
      });
    },
  });
}

// console.log(JSON.stringify(testProg.foldMap(R, runStack).execState([])));
// console.log(JSON.stringify(testProg2.foldMap(R, runStack).execState([])));

// console.log('%s', testProg.foldMap(R, runStack).runState([]));
// console.log('%s', testProg2.foldMap(R, runStack).runState([]));

console.log(JSON.stringify(testProg.runFC(R, runStack).execState([])));
console.log(JSON.stringify(testProg2.runFC(R, runStack).execState([])));

console.log('%s', testProg.runFC(R, runStack).runState([]));
console.log('%s', testProg2.runFC(R, runStack).runState([]));

console.log('%s', testProg);
console.log('%s', testProg2);
