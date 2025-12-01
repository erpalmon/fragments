// src/auth/cognito.js
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const authorize = require('./auth-middleware');

if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  const errorMessage = 'missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

logger.info('Using AWS Cognito for auth');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

// preload JWKS
jwtVerifier
  .hydrate()
  .then(() => logger.info('Cognito JWKS cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'token verified');
      done(null, { email: user.email });
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });

module.exports.authenticate = () => authorize('bearer');
