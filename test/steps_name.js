var Flow = require('../lib/flow');
var assert = require('assert');

describe('# specify steps name', function () {
  var flow = new Flow();

  flow.use(
    'step1',
    function fn1 (ctx, next) {
      ctx.fn1 = true;
      ctx.order.push('fn1');
      next(null, { time: new Date() });
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
      next();
    })
    .use(function fn3 (ctx, next) {
      ctx.order.push('fn3');
      ctx.fn3 = true;
    });

  it('# should run all functions', function () {
    var ctx = {order: []};

    flow.run(ctx);

    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn3, true);
  });

  it('# should run all functions in right order', function () {
    var ctx = {order: []};

    flow.run(ctx);
    assert.deepEqual(['fn1', 'fn11', 'fn2', 'fn3'], ctx.order);
  });

  it('# should run from the specified step', function () {
    var ctx = {order: []};

    flow.run(ctx, 'step2');

    assert.equal(ctx.fn1, undefined);
    assert.equal(ctx.fn11, undefined);
    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn3, true);
  });

  it('# should run from the first step when specified step not exists', function () {
    var ctx = {order: []};

    flow.run(ctx, 'step200');

    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn3, true);
  });
});
