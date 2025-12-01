// src/auth/cognito.js
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const authorize = require('./auth-middleware');

const isTest = process.env.NODE_ENV === 'test';

if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  const message = 'missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID';
  logger.error(message);
  throw new Error(message);
}

logger.info('Using AWS Cognito for auth');

// 🧪 TEST MODE: mock verifier entirely
if (isTest) {
  module.exports.strategy = () =>
    new BearerStrategy((token, done) => {
      // Always succeed with a fake user
      done(null, { email: 'test@example.com' });
    });

  module.exports.authenticate = () => authorize('bearer');
  return;
}

// REAL COGNITO VERIFIER
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

jwtVerifier
  .hydrate()
  .then(() => logger.info('Cognito JWKS cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

module.exports.strategy = () => {
  return new BearerStrategy(async (token, done) => {
    try {
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'token verified');
      done(null, { email: user.email });
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });
};

module.exports.authenticate = () => authorize('bearer');
