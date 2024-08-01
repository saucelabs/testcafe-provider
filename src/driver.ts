import wd, { Client } from 'webdriver';
import { isDevice, isSimulator } from './device';
import { CreateSessionError, WindowSizeTypeError } from './errors';

type Size = {
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
      build: 'TCPRVDR', // TODO make this configurable
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
   * getWindowSize returns the size of the browser, including its utility area like menu and toolbar.
   * @param browser - The browser client instance.
   * @returns Size of the browser window.
   */
  async getWindowSize(browser: Client) {
    if (!browser.isW3C) {
      return browser._getWindowSize();
    }
    const { width, height } = await browser.getWindowRect();
    return { width, height };
  }

  /**
   * getRequestedWindowSize calculates the required browser window size to accommodate the requested viewport size.
   * @param currentViewport - The current size of the viewport.
   * @param currentWindowSize - The current size of the browser window, including its utility area.
   * @param requestedViewport - The desired viewport size.
   * @returns - The required browser window size.
   */
  getRequestedWindowSize(
    currentViewport: Size,
    currentWindowSize: Size,
    requestedViewport: Size,
  ): Size {
    const horizontalDiff = currentWindowSize.width - currentViewport.width;
    const verticalDiff = currentWindowSize.height - currentViewport.height;

    return {
      width: requestedViewport.width + horizontalDiff,
      height: requestedViewport.height + verticalDiff,
    };
  }

  async setWindowSize(browser: Client, WindowSize: Size) {
    const { width, height } = WindowSize;
    if (isNaN(width) || isNaN(height)) {
      throw new WindowSizeTypeError();
    }

    if (!browser.isW3C) return browser._setWindowSize(width, height);

    return await browser.setWindowRect(null, null, width, height);
  }

  async resizeWindow(
    browserId: string,
    width: number,
    height: number,
    currentWidth: number,
    currentHeight: number,
  ) {
    const browser = this.sessions.get(browserId);
    if (!browser) {
      return;
    }

    const currentWindowSize = await this.getWindowSize(browser);
    const requestedWindowSize = this.getRequestedWindowSize(
      {
        width: currentWidth,
        height: currentHeight,
      },
      currentWindowSize as Size,
      { width, height },
    );

    await this.setWindowSize(browser, requestedWindowSize);
  }
}
