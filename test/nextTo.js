var Flow = require('../lib/flow');
var assert = require('assert');

describe('# nextTo()', function () {
  var flow = new Flow();

  flow.use(
    'step1',
    function fn1 (ctx, next) {
      ctx.fn1 = true;
      ctx.order.push('fn1');
      next(null, { time: new Date() });
    },
    function fn11 (ctx, next, nextTo) {
      ctx.fn11 = true;
      ctx.order.push('fn11');
      nextTo('step3');
    }
  );

  flow
    .use('step2', function fn2 (ctx, next, nextTo) {
      ctx.fn2 = true;
      ctx.order.push('fn2');
      nextTo('step1');
    })
    .use('step3', function fn3 (ctx, next) {
      ctx.order.push('fn3');
      ctx.fn3 = true;
      next();
    })
    .use('step4', function fn3 (ctx, next) {
      ctx.order.push('fn4');
      ctx.fn4 = true;
    });

  it('# should jump to the right step (after current step)', function () {
    var ctx = {order: []};

    flow.run(ctx);

    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn2, undefined);
    assert.equal(ctx.fn3, true);
    assert.equal(ctx.fn4, true);
    assert.deepEqual(ctx.order, ['fn1', 'fn11', 'fn3', 'fn4']);
  });

  it('# should jump to the right step (before current step)', function () {
    var ctx = {order: []};

    flow.run(ctx, 'step2');

    assert.equal(ctx.fn2, true);
    assert.equal(ctx.fn1, true);
    assert.equal(ctx.fn11, true);
    assert.equal(ctx.fn3, true);
    assert.equal(ctx.fn4, true);
    assert.deepEqual(ctx.order, ['fn2', 'fn1', 'fn11', 'fn3', 'fn4']);
  });

  it('# should throw error when step name is not string', function () {
    var flow = new Flow();
    var err = null;

    flow.use(
      'step1',
      function fn1 (ctx, next) {
        ctx.fn1 = true;
        next(null, { time: new Date() });
      },
      function fn11 (ctx, next, nextTo) {
        ctx.fn11 = true;
        nextTo({});
      }
    );

    flow.catch(function (e) {
      err = e;
    });

    flow.run({});

    assert.equal(err.message, 'The `step` parameter must be a non-empty string');
  });

  it('# should throw error when step is not exists', function () {
    var flow = new Flow();
    var err = null;

    flow.use(
      'step1',
      function fn1 (ctx, next) {
        ctx.fn1 = true;
        next();
      },
      function fn11 (ctx, next, nextTo) {
        ctx.fn11 = true;
        nextTo('step20');
      }
    );

    flow.catch(function (e) {
      err = e;
    });

    flow.run({});

    assert.equal(err.message, 'The step `step20` not exists');
  });
});
