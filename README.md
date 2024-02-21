# testcafe-browser-provider-saucelabs-official

This is the **saucelabs-official** browser provider plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-browser-provider-saucelabs-official
```

## Usage


You can determine the available browser aliases by running
```
testcafe -b saucelabs-official
```

When you run tests from the command line, use the alias when specifying browsers:

```
testcafe saucelabs-official:browser1 'path/to/test/file.js'
```


When you use API, pass the alias to the `browsers()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('saucelabs-official:browser1')
    .run();
```
