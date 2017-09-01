var Flow = require('../lib/flow');
var assert = require('assert');

describe('# run same flow multiple times', function () {
  var flow = new Flow();
  var order = [];

  flow.use(
    'step1',
    function fn1 (ctx, next) {
      order.push('fn1');
      ctx.recall && flow.run();
      next();
    },
    function fn11 (ctx, next) {
      order.push('fn11');
      next();
    }
  );

  flow
    .use('step2', function fn2 (ctx, next) {
      order.push('fn2');
      next();
    })
    .use(function fn3 (ctx, next) {
      order.push('fn3');
    });

  it('# should run all steps every time the flow run', function () {
    flow.run({
      recall: true
    });

    assert.deepEqual(order, ['fn1', 'fn1', 'fn11', 'fn2', 'fn3', 'fn11', 'fn2', 'fn3']);
  });
});
