// Packages
import request from 'supertest';
// Models
import models from '../../../src/models';
// Helpers
import { INVALID_USERNAME_OR_PASSWORD } from '../../../src/helpers/responseMessages';
// Tests
import TestsHelpers from '../../tests-helpers';

describe('auth sign-in', () => {
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

  it('should sign-in a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/sign-in')
      .send({
        email: 'test@example.com',
        password: 'Test123#',
      })
      .expect(200);

    const refreshToken = response.body.data.tokens.refreshToken;

    expect(refreshToken).toEqual(newUserResponse.body.data.tokens.refreshToken);
  });

  it('should return 401 if we pass an email that is not associated with any user', async () => {
    const response = await request(app)
      .post('/api/auth/sign-in')
      .send({
        email: 'test1@example.com',
        password: 'Test123#',
      })
      .expect(401);

    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual(INVALID_USERNAME_OR_PASSWORD);
  });

  it('should return 401 if we pass an invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/sign-in')
      .send({
        email: 'test@example.com',
        password: 'invalidpassword',
      })
      .expect(401);

    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual(INVALID_USERNAME_OR_PASSWORD);
  });

  it('should create a new refresh token in record if there is not one associated with the user', async () => {
    const { RefreshToken } = models;

    await RefreshToken.destroy({ where: {} });
    let refreshTokensCount = await RefreshToken.count();

    expect(refreshTokensCount).toEqual(0);

    await request(app)
      .post('/api/auth/sign-in')
      .send({ email: 'test@example.com', password: 'Test123#' })
      .expect(200);

    refreshTokensCount = await RefreshToken.count();

    expect(refreshTokensCount).toEqual(1);
  });

  it('should set the token field to a JWT if this field is empty', async () => {
    const { RefreshToken } = models;

    const refreshToken = newUserResponse.body.data.tokens.refreshToken;
    const savedRefreshToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    savedRefreshToken.token = null;
    await savedRefreshToken.save();

    await request(app)
      .post('/api/auth/sign-in')
      .send({ email: 'test@example.com', password: 'Test123#' })
      .expect(200);

    await savedRefreshToken.reload();

    expect(savedRefreshToken.token).not.toBeNull();
  });
});
