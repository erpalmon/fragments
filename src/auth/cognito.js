const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const authorize = require('./auth-middleware');  // ✅ add

if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}
logger.info('Using AWS Cognito for auth');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

jwtVerifier.hydrate()
  .then(() => logger.info('Cognito JWKS cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const claims = await jwtVerifier.verify(token);
      logger.debug({ sub: claims.sub, email: claims.email }, 'verified user token');
      // pass back email-like string; our middleware will hash it
      done(null, claims.email || claims['cognito:username']);
    } catch (err) {
      logger.error({ err }, 'could not verify token');
      done(null, false);
    }
  });

// ✅ now delegate to our middleware (which hashes req.user)
module.exports.authenticate = () => authorize('bearer');
