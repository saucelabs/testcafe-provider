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

export class CreateSessionError extends Error {
  constructor() {
    super('Failed to run test on Sauce Labs: no session id returned');
    this.name = 'CreateSessionError';
  }
}

export class WindowSizeTypeError extends Error {
  constructor() {
    super('Invalid resize value type: width and height must be numbers.');
    this.name = 'WindowSizeTypeError';
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
