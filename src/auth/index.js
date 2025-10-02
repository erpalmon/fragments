// src/auth/index.js

// Decide which auth strategy to use based on env vars.
// - In production, we only allow Cognito.
// - In dev/test, you may use either Cognito or Basic (via HTPASSWD_FILE), but not both.

const isProd = process.env.NODE_ENV === 'production';
const hasCognito =
  !!process.env.AWS_COGNITO_POOL_ID && !!process.env.AWS_COGNITO_CLIENT_ID;
const hasHtpasswd = !!process.env.HTPASSWD_FILE;

// Do not allow both to be configured at the same time
if (hasCognito && hasHtpasswd) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

if (hasCognito) {
  // Prefer / require Cognito when configured
  module.exports = require('./cognito');
} else if (hasHtpasswd && !isProd) {
  // Allow Basic Auth only outside production
  module.exports = require('./basic-auth');
} else {
  // In prod without Cognito, or anywhere without any auth config -> error
  throw new Error('missing env vars: no authorization configuration found');
}
