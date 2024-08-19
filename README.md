# testcafe-browser-provider-sauce

This is the official Sauce Labs browser provider plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-browser-provider-sauce
```

## Setup

Before using this plugin, you need to set the `SAUCE_USERNAME` and
`SAUCE_ACCESS_KEY` environment variables. Your Sauce Labs Username and Access
Key are available from your [dashboard](https://app.saucelabs.com/user-settings).

Furthermore, a [Sauce Connect](https://docs.saucelabs.com/secure-connections/sauce-connect-5/)
tunnel is required to run tests on Sauce Labs. After launching a tunnel, specify
the tunnel name using the `SAUCE_TUNNEL_NAME` environment variable.

## Usage

You can determine the available browser aliases by running

```
testcafe -b sauce
```

When you run tests from the command line, use the alias when specifying browsers:

```
testcafe "sauce:chrome@latest:Windows 11" 'path/to/test/file.js'
```

When you use API, pass the alias to the `browsers()` method:

```js
testCafe
  .createRunner()
  .src('path/to/test/file.js')
  .browsers('sauce:chrome@latest:Windows 11')
  .run();
```

## Configuration

Full overview of the available configuration options.

Mandatory environment variables:

- `SAUCE_USERNAME` - Your Sauce Labs username.
- `SAUCE_ACCESS_KEY` - Your Sauce Labs access key.
- `SAUCE_TUNNEL_NAME` - The Sauce Connect tunnel name.

Optional environment variables:

- `SAUCE_JOB_NAME` - All jobs will be named with this value instead.
- `SAUCE_BUILD` - All jobs will be associated with this build.
- `SAUCE_TAGS` - All jobs will be tagged. Separate tags with commas.
- `SAUCE_REGION` - The Sauce Labs region. Valid values are `us-west-1` (default) or `eu-central-1`.
- `SAUCE_SCREEN_RESOLUTION` - The screen resolution. The format is `1920x1080`.

## Development

To use the local version of the plugin, you can link the package:

```
npm run link
```
