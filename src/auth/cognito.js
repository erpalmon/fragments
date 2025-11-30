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

  // expecting an Identity Token (vs. Access Token)
  tokenUse: 'id',
});

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-1.amazonaws.com/<user-pool-id>/.well-known/jwks.json
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

module.exports.strategy = () => {
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  return new BearerStrategy(async (token, done) => {
    try {
      // verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'token has been successfully verified');

      // create a user, but only with their email
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });
};

module.exports.authenticate = () => authorize('bearer');
