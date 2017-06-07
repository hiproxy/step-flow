/**
 * @file
 * @author zdying
 */

module.exports = StepFlow;

/**
 * 步骤流程控制
 */
function StepFlow () {
  // 存储所有步骤和对应的函数
  this.flows = {};
  // 存储所有的步骤名称，保证执行顺序
  this.steps = [];
  // 存储错误处理函数
  this.errorHanders = [];
}

StepFlow.prototype = {
  constructor: StepFlow,

  /**
   * 添加步骤以及对应的函数。
   * 如果指定的步骤已经存在，这些函数将会追加到这个步骤中。
   * 如果不存在，则新建一个新的步骤。
   *
   * 这里添加的每一个函数在执行时都会接收到参数`(context, next, nextTo, data)`：
   *
   * * `context`：上下文对象。
   * * `next(err[,data])`：执行步骤中的下一个函数，如果不调用，不会执行下一个函数。
   * * `nextTo(step[,data])`：调用这个方法并传递步骤名称，可以跳转到对应的步骤。
   * * `data`：调用`next(null, data)`中传入的数据。
   *
   * 只有调用`next()`，才会继续执行步骤中的下一个函数。如果调用时，传入了非空的参数`err`，则后面的函数不再执行，使用`catch(fn)`设置的错误处理函数会被执行。
   * 如果调用`next()`/`nextTo()`时，传递了参数`data`，**下一个**函数会接收到这个数据。
   * 但是，下一个之后的的函数不会接收到这个数据，除非在下一个函数中再次调用`next()/nextTo()`时传递`data`。
   *
   *
   * @param {String} [stepName='default'] 需要新建或者追加函数的步骤名称，如果省略这个参数，默认使用`default`
   * @return {StepFlow}
   */
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

  /**
   * 执行当前步骤的下一个方法。
   * 如果当前步骤的方法都已经执行完毕，并且还有下一个步骤，会自动执行下一个步骤的方法。
   *
   * @private
   * @param {Any} context 上下文对象，每个步骤的函数都会接受到这个参数
   * @param {Error|String} err 错误信息，如果调用`next()`的时候，第一个参数非空，则会执行错误处理函数。
   * @param {Any} data 需要传递到下一个函数的数据
   * @returns {StepFLow}
   */
  next: function (context, err, data) {
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
    curr(context, this.next.bind(this, context), this.nextTo.bind(this, context), data);

    return this;
  },

  /**
   * 跳转到指定的步骤，然后执行该步骤的方法。
   * 跳转的目标步骤，可以是任何一个存在的步骤，这个步骤可以在当前步骤之前，也可以在当前步骤之后，
   * 甚至就是当前步骤。
   *
   * @private
   * @param {Any} context 上下文对象，每个步骤的函数都会接受到这个参数
   * @param {String} step 步骤名称
   * @param {Any} [data] 需要传递到下一个函数的数据
   * @returns {StepFLow}
   */
  nextTo: function (context, step, data) {
    var steps = this.steps;
    var stepIndex = steps.indexOf(step);

    if (typeof step !== 'string' || !step) {
      throw Error('The `step` parameter must be a non-empty string');
    }

    if (stepIndex === -1) {
      throw Error('The step `' + step + '` not exists');
    }

    this.stepIndex = stepIndex;
    this.flowIndex = 0;

    this.next(context, null, data);

    return this;
  },

  /**
   * 添加错误处理函数，当调用`next(err)`，并传递非空的`err`参数时，会调用这些错误处理函数。
   *
   * 参数`fn`会接受到参数`(err)`, `err`为错误信息。
   *
   * @param {Function} fn 错误处理函数
   * @returns {StepFlow}
   *
   */
  catch: function (fn) {
    this.errorHanders.push(fn);
    return this;
  },

  /**
   * 执行错误处理函数
   *
   * @private
   * @param {any} err 错误信息
   * @returns {StepFlow}
   */
  runErrorHandlers: function (err) {
    this.errorHanders.forEach(function (fn) {
      fn(err);
    });

    return this;
  },

  /**
   * 开始执行步骤函数。
   * 如果指定了步骤名称，将从对应的步骤开始执行。如果没有指定，则从第一个步骤开始执行。
   *
   * @param {Any} context 上下文对象，每个步骤的函数都会接受到这个参数
   * @param {String} stepName 起始步骤名称，默认从第一个步骤开始
   * @returns {StepFlow}
   */
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
