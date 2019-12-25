import express, { Application } from 'express';
import morgan from 'morgan'

// ROUTES
import IndexRoutes from './routes/index.routes'
import PostRoutes from './routes/post.routes'


export class App {
  private app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.app.set('port', this.port || process.env.PORT || 3000);

    this.settings();
    this.middlewares();
    this.routes();
  }

  settings() {
    console.log('port...', this.app.get('port'));
  }

  middlewares() {
    this.app.use(morgan('dev'))
    this.app.use(express.json())
  }

  routes() {
    this.app.use(IndexRoutes);
    this.app.use('/posts', PostRoutes);
  }

  async listen() {
    let port = this.app.get('port')
    await this.app.listen(port);
    console.log('Server on port: ', port)
  }

}
