var Flow = require('../lib/flow');
var assert = require('assert');

describe('# next()', function () {
  var flow = new Flow();

  flow.use(
    'step1',
    function fn1 (ctx, next) {
      ctx.fn1 = true;
      ctx.order.push('fn1');
      next();
    },
    function fn11 (ctx, next) {
      ctx.fn11 = true;
      ctx.order.push('fn11');
      next();
    }
  );

  flow
    .use('step2', function fn2 (ctx, next) {
      ctx.fn2 = true;
      ctx.order.push('fn2');
      // next();
    })
    .use(function fn3 (ctx, next) {
      ctx.order.push('fn3');
      ctx.fn3 = true;
    });

  it('# should not execute the following function if the `next()` has not been called', function () {
    var ctx = {order: []};

    flow.run(ctx);

    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn3, undefined);
  });
});
