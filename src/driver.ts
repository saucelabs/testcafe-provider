import WebDriver, { Client } from 'webdriver';

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

  async openBrowser(url: string, browserName: string) {
    const webDriver = await WebDriver.newSession({
      protocol: 'https',
      hostname: `ondemand.saucelabs.com`, // TODO multi region support
      port: 443,
      user: this.username,
      key: this.accessKey,
      capabilities: {
        name: 'testcafe sauce provider job', // TODO make this configurable
        browserName: browserName,
        buildName: 'TCPRVDR', // TODO make this configurable
        tunnelIdentifier: this.tunnelName,
        idleTimeout: 3600, // 1 hour
      },
      logLevel: 'error',
      connectionRetryTimeout: 9 * 60 * 1000, // 9 minutes
      connectionRetryCount: 3,
      path: '/wd/hub',
    });
    this.sessions.set(browserName, webDriver);

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
