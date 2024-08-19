import wd, { Client } from 'webdriver';
import * as fs from 'fs';
import { isDevice, isSimulator } from './device';
import { CreateSessionError } from './errors';

export type Size = {
  width: number;
  height: number;
};

export class SauceDriver {
  private readonly username: string;
  private readonly accessKey: string;
  private readonly tunnelName: string;
  private sessions = new Map<string, Client>();

  constructor(username: string, accessKey: string, tunnelName: string) {
    this.username = username;
    this.accessKey = accessKey;
    this.tunnelName = tunnelName;
  }

  createCapabilities(
    browserName: string,
    browserVersion: string,
    platformName: string,
  ): WebDriver.Capabilities {
    const sauceOpts = {
      name: 'testcafe sauce provider job', // TODO make this configurable
      build: this.getBuild(),
      tunnelIdentifier: this.tunnelName,
      idleTimeout: 3600, // 1 hour
      enableTestReport: true,
    };

    if (!isDevice(browserName)) {
      return {
        browserName,
        browserVersion,
        platformName,
        'sauce:options': sauceOpts,
      };
    }

    const isSim = isSimulator(browserName);
    return {
      browserName: isSim ? 'Safari' : 'Chrome',
      platformName: isSim ? 'iOS' : 'Android',
      'appium:deviceName': browserName,
      'appium:platformVersion': browserVersion,
      'appium:automationName': isSim ? 'XCUITest' : 'UiAutomator2',
      'sauce:options': sauceOpts,
    };
  }

  async openBrowser(
    browserId: string,
    url: string,
    browserName: string,
    browserVersion: string,
    platformName: string,
  ) {
    const webDriver = await wd.newSession({
      protocol: 'https',
      hostname: `ondemand.us-west-1.saucelabs.com`, // TODO multi region support
      port: 443,
      user: this.username,
      key: this.accessKey,
      capabilities: this.createCapabilities(
        browserName,
        browserVersion,
        platformName,
      ),
      logLevel: 'error',
      connectionRetryTimeout: 9 * 60 * 1000, // 9 minutes
      connectionRetryCount: 3,
      path: '/wd/hub',
    });
    if (!webDriver.sessionId) {
      throw new CreateSessionError();
    }

    this.sessions.set(browserId, webDriver);

    // TODO do we need a keep-alive?

    await webDriver.navigateTo(url);

    return {
      jobUrl: `https://app.saucelabs.com/tests/${webDriver.sessionId}`,
      webDriver: webDriver,
    };
  }

  async closeBrowser(browserId: string) {
    await this.sessions.get(browserId)?.deleteSession();
    this.sessions.delete(browserId);
  }

  /**
   * Calculates the required browser window size to accommodate the requested viewport size.
   * @param newViewport - The requested viewport size.
   * @param viewport - The current size of the viewport.
   * @param windowSize - The current size of the browser window, including its utility area.
   * @returns - The required browser window size.
   */
  getNewWindowSize(newViewport: Size, viewport: Size, windowSize: Size): Size {
    const horizontalDiff = windowSize.width - viewport.width;
    const verticalDiff = windowSize.height - viewport.height;

    return {
      width: newViewport.width + horizontalDiff,
      height: newViewport.height + verticalDiff,
    };
  }

  /**
   * Resizes the browser window to match the requested viewport size.
   * @param browserId - The ID of the browser session.
   * @param viewport - The requested viewport size.
   * @param currentViewport - The current viewport size.
   */
  async resizeWindow(browserId: string, viewport: Size, currentViewport: Size) {
    const browser = this.sessions.get(browserId);
    if (!browser) {
      return;
    }

    const currentWindowSize = await browser.getWindowRect();
    const newWindowSize = this.getNewWindowSize(
      viewport,
      currentViewport,
      currentWindowSize,
    );

    await browser.setWindowRect(
      null,
      null,
      newWindowSize.width,
      newWindowSize.height,
    );
  }

  async takeScreenshot(browserId: string, filepath: string) {
    const browser = this.sessions.get(browserId);
    if (!browser) {
      return;
    }
    const screenBuffer = await browser.takeScreenshot();
    fs.writeFileSync(filepath, Buffer.from(screenBuffer, 'base64'));
  }

  /**
   * Return the build name for the current test run. This is used to group test
   * runs in the Sauce Labs dashboard. The build name is determined by the
   * environment variable SAUCE_BUILD, if set, otherwise it'll be auto generated.
   */
  private getBuild() {
    const build = process.env.SAUCE_BUILD;
    if (build) {
      return build;
    }

    // generate 8 character alphanumeric string
    return Math.random().toString(36).substring(2, 10);
  }
}
