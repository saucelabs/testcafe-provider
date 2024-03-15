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
