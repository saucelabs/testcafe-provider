# testcafe-browser-provider-sauce

This is the official SauceDriver Labs browser provider plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-browser-provider-sauce
```

## Usage

You can determine the available browser aliases by running

```
testcafe -b sauce
```

When you run tests from the command line, use the alias when specifying browsers:

```
testcafe sauce:chrome 'path/to/test/file.js'
```

When you use API, pass the alias to the `browsers()` method:

```js
testCafe
  .createRunner()
  .src('path/to/test/file.js')
  .browsers('sauce:chrome')
  .run();
```

## Development

To use the local version of the plugin, you can link the package:

```
npm run link
```
