import { Client } from 'webdriver';
import { WindowSizeNaNError } from './errors';

export type Size = {
  width: number;
  height: number;
};

// Maximum window size in pixels.
export const maxWindowSize = 2 ** 31 - 1;

/**
 * getNewWindowSize calculates the required browser window size to accommodate the requested viewport size.
 * @param requestedViewport - The requested viewport size.
 * @param currentViewport - The current size of the viewport.
 * @param currentWindowSize - The current size of the browser window, including its utility area.
 * @returns - The required browser window size.
 */
export function getNewWindowSize(
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

export async function setWindowSize(browser: Client, WindowSize: Size) {
  const { width, height } = WindowSize;

  // Validate the window size before setting it.
  if (isNaN(width) || isNaN(height)) {
    throw new WindowSizeNaNError();
  }

  return await browser.setWindowRect(null, null, width, height);
}
