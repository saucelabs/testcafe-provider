/**
 * Checks if the provided name indicates a device (simulator or emulator).
 *
 * @param name - The name to check.
 * @returns `true` if the name includes 'Simulator' or 'Emulator', otherwise `false`.
 */
export function isDevice(name: string): boolean {
  return name.includes('Simulator') || name.includes('Emulator');
}

/**
 * Checks if the provided name indicates a simulator.
 *
 * @param name - The name to check.
 * @returns `true` if the name includes 'Simulator', otherwise `false`.
 */
export function isSimulator(name: string): boolean {
  return name.includes('Simulator');
}
