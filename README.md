# step-flow
step flow

[![Build Status](https://travis-ci.org/zdying/step-flow.svg?branch=master)](https://travis-ci.org/zdying/step-flow)
[![Build status](https://ci.appveyor.com/api/projects/status/okl9e4xs1nsuv7yq/branch/master?svg=true)](https://ci.appveyor.com/project/zdying/step-flow/branch/master)
[![codecov](https://codecov.io/gh/zdying/step-flow/branch/master/graph/badge.svg)](https://codecov.io/gh/zdying/step-flow)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-green.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/zdying/step-flow/blob/master/LICENSE)

# Install

```bash
npm install --save step-flow
```

# Usage

### 1. Import step-flow

```js
var Flow = require('step-flow');
```

### 2. Create instance

```js
var flow = new Flow();
```

### 3. Add steps

One step contains multiple functions:

```js
flow.use(
  'step1',
  function fn1 (ctx, next) {
    ctx.fn1 = true;
    next();
  },
  function fn11 (ctx, next) {
    ctx.fn11 = true;
    next();
  }
);
```

One step contains only one function:

```js
flow
  .use('step2', function fn2 (ctx, next) {
    ctx.fn2 = true;
    // next();
  })
  .use(function fn3 (ctx, next) {
    ctx.fn3 = true;
  });
```

### 4. Error handler

```js
flow.catch(function (err) {
  console.log('flow error:', err);
});
```

### 5. Run with context

```js
var context = {};

flow.run(context)
```

# License

[MIT](https://github.com/zdying/step-flow/blob/master/LICENSE)