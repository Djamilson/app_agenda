const express = require('express')
const multerConfig = require('./config/multer')
const upload = require('multer')(multerConfig)

const routes = express.Router()

const authMiddleware = require('./app/middlewares/auth')
const guestMiddleware = require('./app/middlewares/guest')

const UserController = require('./app/controllers/UserController')
const SessionController = require('./app/controllers/SessionController')
const DashboardController = require('./app/controllers/DashboardController')
const AppointmentController = require('./app/controllers/AppointmentController')
const AvailableController = require('./app/controllers/AvailableController')
const ScheduleController = require('./app/controllers/ScheduleController')

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

routes.use('/app', authMiddleware)
routes.use('/app/logout', SessionController.destroy)
routes.get('/app/dashboard', DashboardController.index)

routes.get('/app/appointments/new/:provider', AppointmentController.create)
routes.get('/app/available/:provider', AvailableController.index)

routes.post('/app/appointments/new/:provider', AppointmentController.store)
routes.get('/app/schedule', ScheduleController.index)

module.exports = routes
