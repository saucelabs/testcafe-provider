import axios, { isAxiosError } from 'axios';

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

export interface Tunnel {
  id: string;
  owner: string;
  status: string;
  tunnel_identifier: string;
}

export type ApiResult<T, E> =
  | { kind: 'ok'; data: T }
  | { kind: 'err'; error: E }
  | { kind: 'unauthorized' };

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

export async function getTunnels(params: {
  username: string;
  accessKey: string;
  region: string;
  filter: string;
}): Promise<ApiResult<{ [key: string]: Tunnel[] }, Error>> {
  const { username, accessKey, region, filter } = params;
  try {
    const resp = await axios.get<{ [key: string]: Tunnel[] }>(
      `https://api.${region}.saucelabs.com/rest/v1/${username}/tunnels`,
      {
        auth: {
          username,
          password: accessKey,
        },
        params: {
          full: true,
          all: true,
          filter: filter !== '' ? filter : undefined,
        },
      },
    );

    return {
      kind: 'ok',
      data: resp.data,
    };
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.response?.status === 401) {
        return {
          kind: 'unauthorized',
        };
      }
      return {
        kind: 'err',
        error: new Error(
          `unexpected response (${e.status}) fetching tunnels: ${e.message}`,
        ),
      };
    }
    return {
      kind: 'err',
      error: new Error(`unknown error fetching tunnels: ${e}`),
    };
  }
}
