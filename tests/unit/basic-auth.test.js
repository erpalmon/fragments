// tests/unit/basic-auth.test.js
const { authorize } = require('../../src/auth/basic-auth');

describe('basic-auth strategy', () => {
  const done = jest.fn();
  afterEach(() => done.mockReset());

  test('accepts credentials when HTPASSWD_FILE set', () => {
    process.env.HTPASSWD_FILE = './tests/fixtures/.htpasswd';
    authorize.success = done;
    authorize.fail = done;
    authorize._verify('user', 'pass', done);
    expect(done).toHaveBeenCalledWith(null, { id: 'user', password: 'pass' });
  });

  test('rejects when no htpasswd and not test env', () => {
    delete process.env.HTPASSWD_FILE;
    process.env.NODE_ENV = 'development';
    authorize.success = done;
    authorize.fail = done;
    authorize._verify('user', 'pass', done);
    expect(done).toHaveBeenCalledWith(null, false);
  });
});
