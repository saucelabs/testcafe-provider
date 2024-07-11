import axios from 'axios';

import { rcompareVersions } from './sort';

export interface Platform {
  // "short_version": "27",
  short_version: string;
  // "long_name": "Google Chrome",
  // "long_name": "iPhone 11 Pro Simulator",
  // "long_name": "Google Pixel 6 GoogleAPI Emulator",
  // "long_name": "iPad Pro (12.9 inch) (3rd generation) Simulator",
  long_name: string;
  // "api_name": "chrome",
  // "api_name": "iphone",
  // "api_name": "android",
  // "api_name": "ipad",
  api_name: string;
  // "long_version": "27.0.1453.116.",
  // "long_version": string;
  // "latest_stable_version": "27",
  // "latest_stable_version": string;
  // "automation_backend": "webdriver",
  automation_backend: string;
  // "os": "Windows 2008"
  os: string;
}

type Browser = string;
type Version = string;
type Os = string;

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

  const browserMap = new Map<Browser, Map<Version, Set<Os>>>();
  resp.data.forEach((p) => {
    let name = p.api_name;
    if (name === 'iphone' || name === 'ipad' || name === 'android') {
      name = p.long_name;
    }
    const versionMap = browserMap.get(name) ?? new Map<Version, Set<Os>>();

    const osList = versionMap.get(p.short_version) ?? new Set<Os>();
    osList.add(p.os);

    versionMap.set(p.short_version, osList);
    browserMap.set(name, versionMap);
  });

  const browserNames = ['chrome', 'firefox', 'safari'];

  const allPlatforms: string[] = [];

  browserNames.forEach((name) => {
    const versionMap = browserMap.get(name);
    if (!versionMap) {
      return;
    }
    [...versionMap.keys()]
      .sort(rcompareVersions)
      .slice(0, 9)
      .forEach((v) => {
        const oses = versionMap.get(v);
        if (!oses) {
          return;
        }

        oses.forEach((os) => {
          allPlatforms.push(`${name}@${v}:${os}`);
        });
      });
  });
  return allPlatforms;
}
