import { Client } from 'webdriver';
import { WindowSizeNaNError } from './errors';

export type Size = {
  width: number;
  height: number;
};

// Maximum window size in pixels.
export const maxWindowSize = 2 ** 31 - 1;

/**
 * getWindowSize returns the size of the browser, including its utility area like menu and toolbar.
 * @param browser - The browser client instance.
 * @returns Size of the browser window.
 */
export async function getWindowSize(browser: Client): Promise<Size> {
  const { width, height } = await browser.getWindowRect();
  return { width, height };
}

/**
 * getNewWindowSize calculates the required browser window size to accommodate the requested viewport size.
 * @param currentViewport - The current size of the viewport.
 * @param currentWindowSize - The current size of the browser window, including its utility area.
 * @param requestedViewport - The desired viewport size.
 * @returns - The required browser window size.
 */
export function getNewWindowSize(
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

export async function setWindowSize(browser: Client, WindowSize: Size) {
  const { width, height } = WindowSize;

  // Validate the window size before setting it.
  if (isNaN(width) || isNaN(height)) {
    throw new WindowSizeNaNError();
  }

  if (!browser.isW3C) return browser._setWindowSize(width, height);

  return await browser.setWindowRect(null, null, width, height);
}
