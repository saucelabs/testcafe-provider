import wd, { Client } from 'webdriver';
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
   * getNewWindowSize calculates the required browser window size to accommodate the requested viewport size.
   * @param requestedViewport - The requested viewport size.
   * @param currentViewport - The current size of the viewport.
   * @param currentWindowSize - The current size of the browser window, including its utility area.
   * @returns - The required browser window size.
   */
  getNewWindowSize(
    requestedViewport: Size,
    currentViewport: Size,
    currentWindowSize: Size,
  ): Size {
    const horizontalDiff = currentWindowSize.width - currentViewport.width;
    const verticalDiff = currentWindowSize.height - currentViewport.height;

    return {
      width: requestedViewport.width + horizontalDiff,
      height: requestedViewport.height + verticalDiff,
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
}
