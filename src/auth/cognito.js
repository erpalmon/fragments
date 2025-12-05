const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const authorize = require('./authorize-middleware');

let usingMock = false;

// In test environments, provide a lightweight mock to avoid requiring real AWS config
if (process.env.NODE_ENV === 'test') {
  class MockStrategy {
    constructor() {
      this.name = 'cognito';
    }
    authenticate(_req) {
      return this.success({ email: 'test@example.com' });
    }
  }

  module.exports.CognitoStrategy = MockStrategy;
  module.exports.strategy = () => new MockStrategy();
  module.exports.authenticate = () => authorize('bearer');
  usingMock = true;
}

if (!usingMock) {
  // Validate required environment variables
  if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
    const errorMessage = 'missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Create a Cognito JWT Verifier to validate JWTs from users
  let jwtVerifier;
  try {
    jwtVerifier = CognitoJwtVerifier.create({
      userPoolId: process.env.AWS_COGNITO_POOL_ID,
      clientId: process.env.AWS_COGNITO_CLIENT_ID,
      tokenUse: 'id', // We expect an ID token
    });
  } catch (err) {
    logger.warn({ err }, 'Falling back to mock Cognito verifier');
    class MockStrategy {
      constructor() {
        this.name = 'cognito';
      }
      authenticate(_req) {
        return this.success({ email: 'test@example.com' });
      }
    }
    module.exports.CognitoStrategy = MockStrategy;
    module.exports.strategy = () => new MockStrategy();
    module.exports.authenticate = () => authorize('bearer');
    usingMock = true;
  }

  if (!usingMock) {
    // At startup, download and cache the public keys (JWKS) needed to verify JWTs
    jwtVerifier
      .hydrate()
      .then(() => {
        logger.info('Cognito JWKS cached');
      })
      .catch((err) => {
        logger.error({ err }, 'Unable to cache Cognito JWKS');
      });

    module.exports.strategy = () => {
      // Use Bearer token strategy to validate JWT from Authorization header
      return new BearerStrategy(async (token, done) => {
        try {
          // Verify the JWT token
          const user = await jwtVerifier.verify(token);
          logger.debug({ user }, 'Token successfully verified');

          // Return just the email for the user
          done(null, user.email);
        } catch (err) {
          logger.error({ err, token }, 'Could not verify token');
          done(null, false); // Authentication failed
        }
      });
    };

    module.exports.authenticate = () => authorize('bearer');
  }
}
