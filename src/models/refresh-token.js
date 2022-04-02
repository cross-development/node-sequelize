// Packages
import { Model, DataTypes } from 'sequelize';

const TokensModel = (sequelize) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  RefreshToken.init(
    { token: { type: DataTypes.TEXT } },
    { sequelize, modelName: 'RefreshToken' }
  );

  return RefreshToken;
};

export default TokensModel;
