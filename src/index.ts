import { SauceDriver } from './driver';
import { AuthError, TunnelNameError, WindowSizeRangeError } from './errors';
import { getPlatforms } from './api';
import { rcompareOses, rcompareVersions } from './sort';
import { isDevice } from './device';

type Browser = string;
type Version = string;
type Os = string;

// Maximum window size in pixels.
const maxWindowSize = 2 ** 31 - 1;

let sauceDriver: SauceDriver;

const platforms: string[] = [];

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
    const build = process.env.SAUCE_BUILD;
    const tags = (process.env.SAUCE_TAGS || '').split(',');

    if (!username || !accessKey) {
      throw new AuthError();
    }
    if (!tunnelName) {
      throw new TunnelNameError();
    }

    sauceDriver = new SauceDriver(username, accessKey, tunnelName, build, tags);

    const resp = await getPlatforms({ username, accessKey });
    const browserMap = new Map<Browser, Map<Version, Set<Os>>>();
    resp.data.forEach((p) => {
      let name = p.api_name;
      if (name === 'iphone' || name === 'ipad' || name === 'android') {
        // NOTE: Prefer the full device name for mobile platforms
        name = p.long_name;
      }
      const versionMap = browserMap.get(name) ?? new Map<Version, Set<Os>>();
      const osList = versionMap.get(p.short_version) ?? new Set<Os>();

      osList.add(p.os);
      versionMap.set(p.short_version, osList);
      browserMap.set(name, versionMap);
    });

    ['chrome', 'firefox', 'safari'].forEach((name) => {
      const versionMap = browserMap.get(name);
      if (!versionMap) {
        return;
      }
      [...versionMap.keys()]
        .sort(rcompareVersions)
        .slice(0, 6)
        .forEach((v, index) => {
          const oses = versionMap.get(v);
          if (!oses) {
            return;
          }

          const sortedOsList = [...oses].sort(rcompareOses);
          if (index === 0) {
            // NOTE: 'latest' is an alias supported by Sauce Labs
            // but not returned when querying the API.
            sortedOsList.forEach((os) => {
              platforms.push(`${name}@latest:${os}`);
            });
          }
          sortedOsList.forEach((os) => {
            platforms.push(`${name}@${v}:${os}`);
          });
        });
    });

    const devices: string[] = [];
    browserMap.forEach((versionMap, name) => {
      if (!isDevice(name)) {
        return;
      }
      [...versionMap.keys()]
        .sort(rcompareVersions)
        .slice(0, 2)
        .forEach((v) => {
          const oses = versionMap.get(v);
          if (!oses) {
            return;
          }
          oses.forEach((os) => {
            devices.push(`${name}@${v}:${os}`);
          });
        });
    });
    devices.sort().reverse();
    platforms.push(...devices);
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
    const [browser, os] = browserName.split(':');
    const [bName, bVersion] = browser.split('@');

    const { jobUrl } = await sauceDriver.openBrowser(
      browserId,
      url,
      bName,
      bVersion,
      os,
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
    return platforms;
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
    return platforms.includes(browserName);
  },

  /**
   * Called by TestCafe to resize the browser window to match the requested viewport size.
   *
   * https://github.com/DevExpress/testcafe/blob/master/src/browser/provider/plugin-host.js#L126
   *
   * @param browserId - The id of the browser session.
   * @param width - The requested viewport width in pixels.
   * @param height - The requested viewport height in pixels.
   * @param currentWidth - The current viewport width in pixels.
   * @param currentHeight - The current viewport height in pixels.
   */
  async resizeWindow(
    browserId: string,
    width: number,
    height: number,
    currentWidth: number,
    currentHeight: number,
  ) {
    if (width > maxWindowSize || height > maxWindowSize) {
      throw new WindowSizeRangeError();
    }
    return sauceDriver.resizeWindow(
      browserId,
      { width, height },
      { width: currentWidth, height: currentHeight },
    );
  },

  /**
   * Called by TestCafe to take a screenshot.
   *
   * https://github.com/DevExpress/testcafe/blob/4a30f1c3b8769ca68c9b7912911f1dd8aa91d62c/src/browser/provider/plugin-host.js#L134
   *
   * @param {string} browserId - The ID of the browser session.
   * @param {string} screenshotPath - The absolute path with .png extension where the screenshot will be saved.
   *                                  It also supports path pattern.
   * @param {number} pageWidth - The width of the page to capture, currently no use.
   * @param {number} pageHeight - The height of the page to capture, currently no use.
   * @param {boolean} fullPage - A flag indicating whether to capture a full-page screenshot.
   *                             Currently, full-page screenshots are not supported.
   */
  async takeScreenshot(
    browserId: string,
    screenshotPath: string,
    pageWidth: number,
    pageHeight: number,
    fullPage: boolean,
  ) {
    if (fullPage) {
      console.warn(
        'Taking a full-page screenshot on the remote browser is not supported.',
      );
    }
    await sauceDriver.takeScreenshot(browserId, screenshotPath);
  },
};
