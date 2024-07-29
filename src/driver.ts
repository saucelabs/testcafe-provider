import wd, { Client } from 'webdriver';
import { isDevice, isSimulator } from './device';
import { CreateSessionError } from './errors';

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
    let webDriver: Client;
    try {
      webDriver = await wd.newSession({
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
    } catch (e) {
      console.error('Failed to create job on Sauce Lab: ', e);
      return { jobUrl: '' };
    }
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
}
