// Packages
import { Model, DataTypes } from 'sequelize';

const RoleModel = (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsTo(models.User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Role.init(
    { role: { type: DataTypes.STRING } },
    { sequelize, modelName: 'Role' }
  );

  return Role;
};

export default RoleModel;
