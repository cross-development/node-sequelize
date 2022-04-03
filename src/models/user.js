// Packages
import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
// Configs
import environment from '../config/environment';

const UserModel = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.RefreshToken = User.hasOne(models.RefreshToken);
      User.Roles = User.hasMany(models.Role);
      User.Posts = User.hasMany(models.Post);
    }

    static async hashPassword(password) {
      return bcrypt.hash(password, environment.saltRounds);
    }

    static async createNewUser({
      email,
      password,
      roles,
      username,
      firstName,
      lastName,
      refreshToken,
    }) {
      return sequelize.transaction(() => {
        let rolesToSave = [];

        if (roles && Array.isArray(roles)) {
          rolesToSave = roles.map((role) => ({ role }));
        }

        return User.create(
          {
            email,
            password,
            username,
            firstName,
            lastName,
            Roles: rolesToSave,
            RefreshToken: { token: refreshToken },
          },
          { include: [User.RefreshToken, User.Roles] }
        );
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Not a valid email address',
          },
          notNull: {
            msg: 'Email is required',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
        validate: {
          len: {
            args: [2, 50],
            msg: 'Username must contain between 2 and 50 characters',
          },
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'First name must contain between 3 and 50 characters',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'Last name must contain between 3 and 50 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  User.prototype.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());

    delete values.refreshToken;
    return values;
  };

  User.beforeSave(async (user, options) => {
    if (user.password) {
      user.password = await User.hashPassword(user.password);
    }
  });

  User.afterCreate((user, options) => {
    delete user.dataValues.password;
  });

  return User;
};

export default UserModel;
