/**
 * @file
 * @author zdying
 */

module.exports = StepFlow;

function StepFlow () {
  // step flow functions
  this.flows = {};
  // step names
  this.steps = [];
  // error handlers
  this.errorHanders = [];
}

StepFlow.prototype = {
  constructor: StepFlow,

  use: function (stepName/*, fn1, fn2, fn3, ... */) {
    var stepNameisFunction = typeof stepName === 'function';
    var step = stepNameisFunction ? 'default' : String(stepName);
    var fns = [].slice.call(arguments, stepNameisFunction ? 0 : 1);
    var flows = this.flows[step];
    var steps = this.steps;

    if (steps.indexOf(step) === -1) {
      steps.push(step);
    }

    if (!Array.isArray(flows)) {
      flows = this.flows[step] = [];
    }

    fns.forEach(function (fn) {
      typeof fn === 'function' && flows.push(fn);
    });

    return this;
  },

  next: function (context, err) {
    if (err) {
      this.runErrorHandlers(err);
      return;
    }

    var steps = this.steps;
    var flows = this.flows;
    var step = steps[this.stepIndex];
    var flow = flows[step];

    if (this.flowIndex >= flow.length) {
      if (this.stepIndex < steps.length - 1) {
        this.stepIndex += 1;
        this.flowIndex = 0;
        step = steps[this.stepIndex];
        flow = flows[steps[this.stepIndex]];
      } else {
        return this;
      }
    }

    var curr = flow[this.flowIndex++];
    curr(context, this.next.bind(this, context), this.nextTo.bind(this, context));

    return this;
  },

  nextTo: function (context, step) {
    var steps = this.steps;
    var stepIndex = steps.indexOf(step);

    if (typeof step !== 'string' || !step) {
      throw Error('The `step` parameter must be a non-empty string');
    }

    if (stepIndex === -1) {
      throw Error(`The step \`${step}\` not exists`);
    }

    this.stepIndex = stepIndex;
    this.flowIndex = 0;

    this.next(context, null);
  },

  catch: function (fn) {
    this.errorHanders.push(fn);
    return this;
  },

  runErrorHandlers: function (err) {
    this.errorHanders.forEach(function (fn) {
      fn(err);
    });
  },

  run: function (context, stepName) {
    var steps = this.steps;
    var stepIndex = stepName ? steps.indexOf(stepName) : 0;
    var flowIndex = 0;

    if (stepIndex === -1) {
      stepIndex = 0;
    }

    this.stepIndex = stepIndex;
    this.flowIndex = flowIndex;

    this.next(context || {}, null);

    return this;
  }
};

// var seq = new StepFlow();

// seq.use(
//   'step1',
//   function fn1 (ctx, next) {
//     console.log('fn1:', ctx);
//     ctx.fn1 = true;
//     next(null, { time: new Date() });
//   },
//   function fn11 (ctx, next) {
//     console.log('fn11:', ctx);
//     ctx.fn11 = true;
//     next('fn11 has some error.');
//   }
// );

// seq
// .use('step2', function fn2 (ctx, next) {
//   console.log('fn2:', ctx);
//   ctx.fn2 = true;
//   next();
// })
// .use('step3', function fn3 (ctx, next) {
//   console.log('fn3:', ctx);
//   ctx.fn3 = true;

//   next();
// })
// .use('step4', function fn4 (ctx, next) {
//   console.log('fn4:', ctx);
//   ctx.fn4 = true;
// });

// seq
// .use('step2', function fn21 (ctx, next) {
//   console.log('fn21:', ctx);
//   ctx.fn21 = true;
//   next();
// })
// .use('step3', function fn31 (ctx, next) {
//   console.log('fn31:', ctx);
//   ctx.fn31 = true;

//   next();
// })
// .catch(function (err) {
//   console.log('steps has error: ', err);
// });

// var ctx = {
//   initialized: true
// };

// seq.run(ctx, 'step1');
