import { SauceDriver } from './driver.js';
import { AuthError, TunnelNameError } from './errors';
import { getPlatforms } from './api';

let sauceDriver: SauceDriver;

/**
 * The Sauce Labs browser provider plugin for TestCafe.
 *
 * CAUTION: Do not export the `default` keyword, as TestCafe will not be able to
 * load the plugin. Neither does it support the `exports =` syntax without
 * `module`.
 */
module.exports = {
  /**
   * Inspected by TestCafe to check whether the browser provider supports
   * multiple browsers.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/index.ts#L65
   */
  isMultiBrowser: true,

  /**
   * Called by TestCafe to initialize the browser provider.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L81
   */
  async init(): Promise<void> {
    const username = process.env.SAUCE_USERNAME;
    const accessKey = process.env.SAUCE_ACCESS_KEY;
    const tunnelName = process.env.SAUCE_TUNNEL_NAME;

    if (!username || !accessKey) {
      throw new AuthError();
    }
    if (!tunnelName) {
      throw new TunnelNameError();
    }

    sauceDriver = new SauceDriver(username, accessKey, tunnelName);
  },

  /**
   * Called by TestCafe to open a browser.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L72
   *
   * @param browserId
   * @param url
   * @param browserName
   */
  async openBrowser(
    browserId: string,
    url: string,
    browserName: string,
  ): Promise<void> {
    // TODO check available concurrency and wait if necessary

    // TODO check tunnel status and wait if necessary
    // See https://docs.saucelabs.com/secure-connections/sauce-connect-5/operation/readiness-checks/.

    console.log('Starting browser on Sauce Labs...');
    const { jobUrl } = await sauceDriver.openBrowser(
      browserId,
      url,
      browserName,
    );
    console.log('Browser started.');

    // Pass the job URL to TestCafe, which it will append to the test report.
    //  Output:
    //    Running tests in:
    //    - Chrome 122.0.0.0 / Windows 10 (https://app.saucelabs.com/tests/8545f0fb12a24da290af1f6b87dcc530)
    this.setUserAgentMetaInfo(browserId, jobUrl, { appendToUserAgent: true });
  },

  /**
   * Called by TestCafe to close a browser.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L76
   *
   * @param browserId
   */
  async closeBrowser(browserId: string): Promise<void> {
    await sauceDriver.closeBrowser(browserId);
  },

  /**
   * Called by TestCafe at the end of the test run.
   * Perform any cleanups necessary here.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L85
   */
  async dispose(): Promise<void> {},

  /**
   * Called by TestCafe to get the list of available browsers.
   *
   * E.g. `"testcafe -b sauce"` will call this method to print the available
   * browsers.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L91
   */
  async getBrowserList(): Promise<string[]> {
    const username = process.env.SAUCE_USERNAME ?? '';
    const accessKey = process.env.SAUCE_ACCESS_KEY ?? '';
    const browsers = await getPlatforms({ username, accessKey });

    return browsers;
  },

  /**
   * Called by TestCafe to verify if the user specified browser is valid.
   *
   * E.g. `"testcafe -b sauce:chrome@latest"` will call this method to verify.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L95
   * @param browserName
   */
  async isValidBrowserName(browserName: string): Promise<boolean> {
    return (await this.getBrowserList()).includes(browserName);
  },

  /**
   * Called by TestCafe to resize the browser window.
   *
   * https://github.com/DevExpress/testcafe/blob/master/src/browser/provider/plugin-host.js#L126
   */
  async resizeWindow(/* id, width, height, currentWidth, currentHeight */) {
    this.reportWarning(
      'The window resize functionality is not supported by the Sauce Labs browser provider plugin.',
    );
  },

  /**
   * Called by TestCafe to take a screenshot.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L134
   */
  async takeScreenshot(/* id, screenshotPath, pageWidth, pageHeight */) {
    this.reportWarning(
      'The screenshot functionality is not supported by the Sauce Labs browser provider plugin.',
    );
  },
};
