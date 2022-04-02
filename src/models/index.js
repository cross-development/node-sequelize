// Core
import fs from 'fs';
import path from 'path';

let models = {};

const registerModels = (sequelize) => {
  const thisFile = path.basename(__filename); // index.js
  const modelFiles = fs.readdirSync(__dirname); // current models folder

  const filteredModelFiles = modelFiles.filter((file) => {
    return file !== thisFile && file.slice(-3) === '.js';
  });

  for (const file of filteredModelFiles) {
    const model = require(path.join(__dirname, file)).default(sequelize);
    models[model.name] = model;
  }

  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = sequelize;
};

export { registerModels };
export default models;
