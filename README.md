# testcafe-browser-provider-sauce

This is the official Sauce Labs browser provider plugin for [TestCafe](http://devexpress.github.io/testcafe).

:construction: This plugin is currently in beta. We caution against using it in
production pipelines. We _do_ seek feedback and encourage you to report any
issues you encounter.

## Install

```shell
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

```shell
testcafe -b sauce
```

When you run tests from the command line, use the alias when specifying browsers:

```shell
testcafe "sauce:chrome@latest:Windows 11" path/to/test/file.js
```

When you use API, pass the alias to the `browsers()` method:

```js
testCafe
  .createRunner()
  .src('path/to/test/file.js')
  .browsers('sauce:chrome@latest:Windows 11')
  .run();
```

## Enhanced Reporting

This plugin can be further enhanced when used in conjunction with
[testcafe-reporter-saucelabs](https://github.com/saucelabs/testcafe-reporter).

Our reporter will automatically detect if TestCafe is running remote browser
sessions on Sauce Labs and attach test results to the corresponding Sauce Labs
job.

![test_cases.webp](assets/test_cases.avif)

_Note: The build name and tags as defined by the provider plugin take precedence
over those defined by the reporter._

```shell
testcafe "sauce:chrome@latest:Windows 11" path/to/test/file.js --reporter saucelabs
```

## Configuration

Full overview of the available configuration options.

Mandatory environment variables:

- `SAUCE_USERNAME` - Your Sauce Labs username.
- `SAUCE_ACCESS_KEY` - Your Sauce Labs access key.
- `SAUCE_TUNNEL_NAME` - The Sauce Connect tunnel name.

Optional environment variables:

- `SAUCE_JOB_NAME` - Specify the job name for all jobs. Defaults to `TestCafe via ${browserName}@${browserVersion} on ${platformName}`.
- `SAUCE_BUILD` - All jobs will be associated with this build. The default value is randomly generated.
- `SAUCE_TAGS` - A comma separated list of tags to apply to all jobs.
- `SAUCE_REGION` - The Sauce Labs region. Valid values are `us-west-1` (default) or `eu-central-1`.
- `SAUCE_SCREEN_RESOLUTION` - The desktop browser screen resolution (not applicable to mobile). The format is `1920x1080`.
- `SAUCE_TUNNEL_WAIT_SEC` - The amount of time to wait, in seconds, for
  the tunnel defined by `SAUCE_TUNNEL_NAME` to be ready. Default is "60".
