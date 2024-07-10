import axios from 'axios';

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
  return resp.data.map((p) => {
    switch (p.api_name) {
      case 'iphone':
      case 'ipad':
      case 'android':
        return `${p.long_name}@${p.short_version}`;
      default:
        return `${p.api_name}@${p.short_version}:${p.os}`;
    }
  });
}
