export class AuthError extends Error {
  constructor() {
    super(
      'Authentication failed. Please assign the correct username and access key ' +
        'to the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables.',
    );
    this.name = 'AuthError';
  }
}

export class TunnelNameError extends Error {
  constructor() {
    super(
      'The SAUCE_TUNNEL_NAME environment variable is not set. Please start a ' +
        'tunnel first and set the SAUCE_TUNNEL_NAME environment variable.',
    );
    this.name = 'TunnelNameError';
  }
}

export class TunnelNotReadyError extends Error {
  constructor() {
    super('Timed out waiting for a tunnel to be ready.');
    this.name = 'TunnelNotReadyError';
  }
}

export class CreateSessionError extends Error {
  constructor() {
    super('Failed to run test on Sauce Labs: no session id returned');
    this.name = 'CreateSessionError';
  }
}

export class WindowSizeRangeError extends Error {
  constructor() {
    super(
      'Invalid resize value: width and height must be within the range of 0 to 2^31 - 1.',
    );
    this.name = 'WindowSizeRangeError';
  }
}

export class InvalidRegionError extends Error {
  constructor() {
    super(
      'Invalid region. The region must be one of the following: us-west-1, eu-central-1.',
    );
    this.name = 'InvalidRegionError';
  }
}
