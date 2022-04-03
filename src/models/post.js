// Packages
import { Model, DataTypes } from 'sequelize';

const PostModel = (sequelize) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Post.init(
    {
      title: { type: DataTypes.STRING(100), allowNull: false },
      text: { type: DataTypes.STRING(500), allowNull: false },
    },
    { sequelize, modelName: 'Post' }
  );

  return Post;
};

export default PostModel;
