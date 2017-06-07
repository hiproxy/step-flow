var Flow = require('../lib/flow');
var assert = require('assert');

describe('# next()', function () {
  var flow = new Flow();
  var context = null;

  flow.use(
    'step1',
    function fn1 (ctx, next) {
      context = ctx;
      ctx.fn1 = true;
      next(null, 11);
    },
    function fn11 (ctx, next, nextTo, data) {
      ctx.fn11 = true;
      ctx.fn11Data = data;
      next();
    }
  );

  flow.use(
    'step2',
    function fn2 (ctx, next, nextTo, data) {
      ctx.fn2Data = data;
      next(null, 21);
    },

    function fn21 (ctx, next, nextTo, data) {
      ctx.fn21Data = data;
      next();
    }
  );

  flow.run();

  it('# should has default context', function () {
    assert.notEqual(context, null);
    assert.equal(context.fn1, true);
    assert.equal(context.fn11, true);
  });

  it('# should pass data to the next function', function () {
    assert.equal(context.fn11Data, 11);
    assert.equal(context.fn21Data, 21);
  });

  it('# should only pass data to the next function', function () {
    assert.equal(context.fn2Data, undefined);
  });
});
