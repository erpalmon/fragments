const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const { authorize } = require('./auth-middleware');

if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error(
    'missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID'
  );
}

logger.info('Using AWS Cognito for auth');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

jwtVerifier.hydrate();

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const claims = await jwtVerifier.verify(token);

      done(null, {
        email: claims.email || claims["cognito:username"],
      });
    } catch (err) {
      logger.error({ err });
      done(null, false);
    }
  });

module.exports.authenticate = () => authorize('bearer');
