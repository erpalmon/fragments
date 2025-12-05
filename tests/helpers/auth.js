const { TEST_USER } = require('../setup');

module.exports.getAuthHeader = (user = TEST_USER) => {
  const credentials = `${user.email}:${user.password}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
};
