// tests/setup-basic-auth.js
require('./setup');

// For Basic Auth tests
process.env.HTPASSWD_FILE = require('path').join(__dirname, 'fixtures/.htpasswd');
