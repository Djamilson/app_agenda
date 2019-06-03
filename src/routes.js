const express = require('express')
const multerConfig = require('./config/multer')
const upload = require('multer')(multerConfig)

const routes = express.Router()

const authMiddleware = require('./app/middlewares/auth')
const guestMiddleware = require('./app/middlewares/guest')

const QuiosqueController = require('./app/controllers/QuiosqueController')
const UserController = require('./app/controllers/UserController')
const SessionController = require('./app/controllers/SessionController')
const DashboardController = require('./app/controllers/DashboardController')
const AppointmentController = require('./app/controllers/AppointmentController')
const AvailableController = require('./app/controllers/AvailableController')
const AvailableQuiosqueController = require('./app/controllers/AvailableQuiosqueController')
const ScheduleController = require('./app/controllers/ScheduleController')
const ReservaController = require('./app/controllers/ReservaController')

const FileController = require('./app/controllers/FileController')

routes.use((req, res, next) => {
  res.locals.flashError = req.flash('error')
  res.locals.flashSuccess = req.flash('success')

  next()
})

routes.use('/files/:file', FileController.show)

routes.get('/', guestMiddleware, SessionController.create)
routes.post('/signin', SessionController.store)

routes.get('/signup', guestMiddleware, UserController.create)
routes.post('/signup', upload.single('avatar'), UserController.store)

routes.post('/confirmation', UserController.confirmationPost)
routes.post('/resend', UserController.resendTokenPost)

routes.use('/app', authMiddleware)
routes.use('/app/logout', SessionController.destroy)
routes.get('/app/dashboard', DashboardController.index)

routes.get('/app/quiosque', QuiosqueController.index)
routes.post('/app/quiosque', upload.single('avatar'), QuiosqueController.store)

routes.get('/app/appointments/new/:provider', AppointmentController.create)
routes.post('/app/appointments/new/:provider', AppointmentController.store)

routes.get('/app/available/:provider', AvailableController.index)
routes.get('/app/schedule', ScheduleController.index)

routes.get('/app/user', UserController.index)
routes.post('/app/user', upload.single('avatar'), UserController.storeNew)

routes.get(
  '/app/reservas/new/:provider',
  AvailableQuiosqueController.index,
  ReservaController.create
)
routes.post('/app/reservas/new/:provider', ReservaController.store)

routes.get(
  '/app/availableQuiosque/:provider',
  AvailableQuiosqueController.index
)

module.exports = routes
