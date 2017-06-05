/**
 * @file
 * @author zdying
 */

module.exports = Group;

function Group (group) {
  this.flows = [];

  this.cache = {};

  this.groupName = group || 'default';

  this.cache[this.groupName] = [];
}

Group.prototype = {
  constructor: Group,

  group: function (name) {
    name = name || 'default';

    this.groupName = name;

    if (!(name in this.cache)) {
      this.cache[name] = [];
    }

    return this;
  },

  use: function (/*, fn1, fn2, fn3, ... */) {
    var fns = [].slice.apply(arguments);
    var flows = this.cache[this.groupName];

    fns.forEach(function (fn) {
      if (typeof fn === 'function') {
        flows.push(fn);
      }
    });

    return this;
  },

  next: function (context, err, data) {
    var curr = this.cache[this.groupName][++this.__index__];

    if (err) {
      this.catch(err);
    } else {
      curr(context, this.next.bind(this, context));
    }

    return this;
  },

  catch: function (err) {
    console.log(err);
    return this;
  },

  run: function (/* group, */context, index) {
    // this.groupName = group || 'default';
    var flows = this.cache[this.groupName];

    index = index || 0;

    this.__index__ = index;

    if (typeof flows[index] === 'function') {
      flows[index](context, this.next.bind(this, context));
    }

    return this;
  }
};

// var seq = new Group();

// seq.use(
//   function fn1 (ctx, next) {
//     console.log('fn1:', ctx);
//     ctx.fn1 = true;
//     next(null, { time: new Date() });
//   },
//   function fn11 (ctx, next) {
//     console.log('fn11:', ctx);
//     ctx.fn11 = true;
//     next();
//   }
// );

// seq.use(function fn2 (ctx, next) {
//   console.log('fn2:', ctx);
//   ctx.fn2 = true;
//   next();
// });

// seq.use(function fn3 (ctx, next) {
//   console.log('fn3:', ctx);
//   ctx.fn3 = true;

//   // next();
// });

// seq.use(function fn4 (ctx, next) {
//   console.log('fn4:', ctx);
//   ctx.fn4 = true;
// });

// seq.group('test')
//   .use(function fn5 (ctx, next) {
//     console.log('fn5:', ctx);
//     ctx.fn5 = true;
//   });

// var ctx = {
//   initialized: true
// };

// seq.run(ctx);
