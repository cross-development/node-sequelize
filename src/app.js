// Packages
import express from 'express';
import logger from 'morgan';
// Routes
import routes from './routes';
// Configs
import environment from './config/environment';
// Utils
import { accessLogStream } from './utils/logStream';
// Middleware
import errorsMiddleware from './middleware/errors';

export default class App {
  constructor() {
    this.app = express();
    this.app.use(
      logger('dev', {
        stream: accessLogStream,
        skip: () => environment.nodeEnv === 'test',
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.setRoutes();
  }

  setRoutes() {
    this.app.use('/api', routes);
    this.app.use(errorsMiddleware);
  }

  getApp() {
    return this.app;
  }

  listen() {
    const { port } = environment;

    this.app.listen(port, () => console.log(`Listening at port ${port}`));
  }
}
