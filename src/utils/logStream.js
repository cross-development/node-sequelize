//Core
import fs from 'fs';
import path from 'path';

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
);

const databaseLogStream = (sql, qwe) => {
  return fs
    .createWriteStream(path.join(__dirname, '../logs/database.log'), {
      flags: 'a',
    })
    .write(`${sql}\n`);
};
export { accessLogStream, databaseLogStream };
