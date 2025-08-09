import { Express, Router } from 'express'
import fg from 'fast-glob'

export default (app: Express): void => {
  const router = Router()
  app.use('/api', router)

  // fg.sync('**/src/routes/**').forEach(folder => {
  //   fg.sync(`**/${folder}/**.ts`).map(async file => {
  //     (await import(`../../${file}`)).default(router)
  //   })
  // })


  fg.sync('**/src/routes/**.ts').map(async file => {
    (await import(`../../${file}`)).default(router)
  })
}