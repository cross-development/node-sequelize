// Packages
import request from 'supertest';
// Models
import models from '../../../src/models';
// Helpers
import { OK_RESPONSE } from '../../../src/helpers/responseMessages';
// Tests
import TestsHelpers from '../../tests-helpers';

describe('auth sign-out', () => {
  let app;
  let newUserResponse;

  beforeAll(async () => {
    await TestsHelpers.startDb();
    app = TestsHelpers.getApp();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async () => {
    await TestsHelpers.syncDb();

    newUserResponse = await TestsHelpers.registerNewUser({
      email: 'test@example.com',
      password: 'Test123#',
    });
  });

  describe('sign-out', () => {
    it('should fail if the refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/sign-out')
        .set('Authorization', 'Bearer invalidtoken')
        .send()
        .expect(401);

      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Invalid token');
    });
  });

  it('should sign-out a user successfully', async () => {
    const accessToken = newUserResponse.body.data.tokens.accessToken;

    const response = await request(app)
      .post('/api/auth/sign-out')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(200);

    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual(OK_RESPONSE);

    const { User, RefreshToken } = models;

    const user = await User.findOne({
      where: { email: 'test@example.com' },
      include: RefreshToken,
    });

    expect(user.RefreshToken.token).toBeNull();
  });
});
