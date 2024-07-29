/**
 * Checks if the provided name indicates a device (simulator or emulator).
 *
 * @param name - The name to check.
 * @returns `true` if the name includes 'simulator' or 'emulator', otherwise `false`.
 */
export function isDevice(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('simulator') || n.includes('emulator');
}

/**
 * Checks if the provided name indicates a simulator.
 *
 * @param name - The name to check.
 * @returns `true` if the name includes 'simulator', otherwise `false`.
 */
export function isSimulator(name: string): boolean {
  return name.toLowerCase().includes('simulator');
}
