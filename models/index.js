// models/index.js
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import sequelize from '../config/configs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

async function loadModels() {
  const modelFiles = fs.readdirSync(__dirname)
    .filter(file =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.js')
    );

  for (const file of modelFiles) {
    const modelModule = await import(`./${file}`);
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }

  for (const model of Object.values(db)) {
    if (model.associate) {
      model.associate(db);
    }
  }

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}

export default await loadModels();
