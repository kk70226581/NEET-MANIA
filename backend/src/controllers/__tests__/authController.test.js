jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'test-token') }));
jest.mock('../../models/User', () => ({ findOne: jest.fn(), create: jest.fn() }));

const User = require('../../models/User');
const { adminLogin } = require('../authController');

const makeResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('adminLogin configuration', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  const originalAdminPassword = process.env.ADMIN_PASSWORD;

  afterEach(() => {
    if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = originalAdminEmail;

    if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalAdminPassword;

    jest.clearAllMocks();
  });

  it('returns a configuration error before querying MongoDB when ADMIN_EMAIL is invalid', async () => {
    process.env.ADMIN_EMAIL = 'admin@medicalmania';
    process.env.ADMIN_PASSWORD = 'a-secure-test-password';
    const res = makeResponse();

    await adminLogin({ body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } }, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'ADMIN_EMAIL must be a valid email address (for example, owner@medicalmania.site).',
    });
    expect(User.findOne).not.toHaveBeenCalled();
  });
});
