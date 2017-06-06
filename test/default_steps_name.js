var Flow = require('../lib/flow');
var assert = require('assert');

describe('# default steps name', function () {
  var flow = new Flow();
  var order = [];

  flow.use(
    function fn1 (ctx, next) {
      ctx.fn1 = true;
      order.push('fn1');
      next();
    },
    function fn11 (ctx, next) {
      ctx.fn11 = true;
      order.push('fn11');
      next();
    }
  );

  flow
    .use(function fn2 (ctx, next) {
      ctx.fn2 = true;
      order.push('fn2');
      next();
    })
    .use(function fn3 (ctx, next) {
      order.push('fn3');
      ctx.fn3 = true;
    });

  var ctx = {
    initialized: true
  };

  flow.run(ctx);

  it('# should run all functions', function () {
    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn3, true);
  });

  it('# should run all functions in right order', function () {
    assert.deepEqual(['fn1', 'fn11', 'fn2', 'fn3'], order);
  });
});
