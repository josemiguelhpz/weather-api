import express from 'express'
import { config } from './config/default'
import { STATUS_CODE } from './utils/globals'
import { errorHandler } from './utils/errors/error-handler'
import { IWheatherRouter } from '../@types/express-custom'
import { setMiddlewares } from './middlewares'

class Server {
  public app: express.Application
  private router: IWheatherRouter
  private port
  private basePath: string
  constructor(router: IWheatherRouter) {
    this.app = express()
    this.port = config.server.port
    this.basePath = config.server.basePath ? config.server.basePath : ''
    this.router = router
    setMiddlewares(this.app)
    this.routes()
    this.config()
  }

  public config(): void {
    this.app.set('port', this.port)
  }

  public routes(): void {
    this.app.use('/health', (req, res, next) => res.status(200).json({ status: 'OK' }))
    this.app.use(this.basePath, this.router.getRouter())
    // Error Hanldler
    this.app.use(errorHandler)
    this.app.use((req, res) => {
      res.status(STATUS_CODE.NOT_FOUND).json([{ code: 'NOT_FOUND', description: 'Resource not found' }])
    })
  }

  public start(): void {
    try {
      this.app.listen(this.app.get('port'), () => {
        console.log('Server started at on port', this.app.get('port'))
        console.log('Routes:')
        this.router
          .getRouter()
          .stack.filter((r) => r.route)
          .map((r) => console.log('Method:', r.route.stack[0].method.toUpperCase(), ' Path: ', r.route.path))
      })
    } catch (err) {
      console.log({ ...err })
    }
  }
}

export { Server }
