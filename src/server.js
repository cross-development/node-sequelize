// Configs
import './config';
import dbConfig from './config/database';
import environment from './config/environment';
// Database
import Database from './database';

async function initServer() {
  try {
    const db = new Database(environment.nodeEnv, dbConfig);
    await db.connect();

    const App = require('./app').default;
    const app = new App();

    app.listen();
  } catch (err) {
    console.error(
      'Something went wrong when initializing the server:\n',
      err.stack
    );
  }
}

initServer();
