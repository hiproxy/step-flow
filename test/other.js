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
      next();
    },
    function fn11 (ctx, next) {
      ctx.fn11 = true;
      next();
    }
  );

  it('# should has default context', function () {
    flow.run();

    assert.notEqual(context, null);
    assert.equal(context.fn1, true);
    assert.equal(context.fn11, true);
  });
});
