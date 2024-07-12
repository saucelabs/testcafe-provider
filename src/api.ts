import axios from 'axios';

export interface Platform {
  /**
   * Major version of the platform, e.g. chrome 127
   */
  short_version: string;
  /**
   * The full name of the platform
   * e.g.
   *   - Google Chrome
   *   - iPhone 11 Pro Simulator
   *   - Google Pixel 6 GoogleAPI Emulator
   *   - iPad Pro (12.9 inch) (3rd generation) Simulator
   */
  long_name: string;
  /**
   * The internal name of the platform
   * e.g.
   *  - chrome
   *  - iphone
   *  - android
   *  - ipad
   */
  api_name: string;
  /**
   * The operating system of the platform
   */
  os: string;
}

export async function getPlatforms(params: {
  username: string;
  accessKey: string;
}) {
  const { username, accessKey } = params;
  const resp = await axios.get<Platform[]>(
    'https://api.us-west-1.saucelabs.com/rest/v1/info/platforms/all',
    {
      auth: {
        username,
        password: accessKey,
      },
    },
  );

  return resp;
}
