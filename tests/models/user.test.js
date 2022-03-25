import TestsHelpers from '../tests-helpers';
import models from '../../src/models';

describe('User', () => {
  beforeAll(async () => {
    await TestsHelpers.startDb();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async () => {
    await TestsHelpers.syncDb();
  });

  describe('static methods', () => {
    describe('hashPassword', () => {
      it('should hash the password passed in the arguments', async () => {
        const { User } = models;

        const password = 'Test123#';
        const hashedPassword = await User.hashPassword(password);

        expect(password).not.toEqual(hashedPassword);
      });
    });

    describe('createNewUser', () => {
      it('should create a new user successfully', async () => {
        const { User } = models;

        const data = {
          email: 'test@example.com',
          password: 'test123#',
          roles: ['admin', 'customer'],
          username: 'test',
          firstName: 'Cross',
          lastName: 'Dev',
          refreshToken: 'test-refresh-token',
        };

        const newUser = await User.createNewUser(data);
        const usersCount = await User.count();

        const savedRoles = newUser.Roles.map(
          (savedRole) => savedRole.role
        ).sort();

        expect(usersCount).toEqual(1);
        expect(newUser.email).toEqual(data.email);
        expect(newUser.password).toBeUndefined();
        expect(newUser.username).toEqual(data.username);
        expect(newUser.firstName).toEqual(data.firstName);
        expect(newUser.lastName).toEqual(data.lastName);
        expect(newUser.RefreshToken.token).toEqual(data.refreshToken);
        expect(newUser.Roles.length).toEqual(2);
        expect(savedRoles).toEqual(data.roles.sort());
      });

      it('should error if we create a new user with invalid email', async () => {
        const { User } = models;

        const data = {
          email: 'test',
          password: 'test123#',
        };

        let error;

        try {
          await User.createNewUser(data);
        } catch (err) {
          error = err;
        }

        const errorObj = error.errors[0];

        expect(error).toBeDefined();
        expect(error.errors.length).toEqual(1);
        expect(errorObj.path).toEqual('email');
        expect(errorObj.message).toEqual('Not a valid email address');
      });

      it('should error if we do not pass email', async () => {
        const { User } = models;

        const data = {
          password: 'test123#',
        };

        let error;

        try {
          await User.createNewUser(data);
        } catch (err) {
          error = err;
        }

        const errorObj = error.errors[0];

        expect(error).toBeDefined();
        expect(error.errors.length).toEqual(1);
        expect(errorObj.path).toEqual('email');
        expect(errorObj.message).toEqual('Email is required');
      });

      it('should error if we create a new user with invalid username', async () => {
        const { User } = models;

        const data = {
          email: 'test@example.com',
          password: 'test123#',
          username: 'u',
        };

        let error;

        try {
          await User.createNewUser(data);
        } catch (err) {
          error = err;
        }

        const errorObj = error.errors[0];

        expect(error).toBeDefined();
        expect(error.errors.length).toEqual(1);
        expect(errorObj.path).toEqual('username');
        expect(errorObj.message).toEqual(
          'Username must contain between 2 and 50 characters'
        );
      });
    });
  });
});
