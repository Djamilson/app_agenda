const express = require('express')
const multerConfig = require('./config/multer')
const upload = require('multer')(multerConfig)

const routes = express.Router()

const authMiddleware = require('./app/middlewares/auth')
const guestMiddleware = require('./app/middlewares/guest')

const controllers = require('./app/controllers')

routes.use((req, res, next) => {
  res.locals.flashError = req.flash('error')
  res.locals.flashSuccess = req.flash('success')

  next()
})

routes.use('/files/:file', controllers.FileController.show)
routes.get('/', guestMiddleware, controllers.SessionController.create)
routes.post('/signin', controllers.SessionController.store)

routes.get('/signup', guestMiddleware, controllers.UserController.create)
routes.post(
  '/signup',
  upload.single('avatar'),
  controllers.UserController.store
)

routes.get('/confirmation/:token', controllers.UserController.confirmationPost)
routes.post('/confirmation', controllers.UserController.confirmationPost)

routes.get('/redefinirSenha/:token', controllers.RedefinirSenhaController.index)
routes.post('/resend', controllers.UserController.resendTokenPost)

routes.get(
  '/solicitarRecuperacaoSenha',
  controllers.RedefinirSenhaController.solicitarRecuperacaoSenha
)
routes.post(
  '/redefinirSenhaPost',
  controllers.RedefinirSenhaController.redefinirSenhaPost
)

routes.use('/app', authMiddleware)
routes.use('/app/logout', controllers.SessionController.destroy)
routes.get(
  '/app/dashboard',
  controllers.DashboardQuiosqueController.index,
  controllers.DashboardController.index
)

routes.get(
  '/app/quiosque/inativos',
  controllers.QuiosqueInativosController.index
)

routes.get('/app/quiosque', controllers.QuiosqueController.index)
routes.post(
  '/app/quiosque',
  upload.single('avatar'),
  controllers.QuiosqueController.store
)

routes.post(
  '/app/dashboard/desabilitarquiosque',
  controllers.DashboardController.desabilitarQuiosque
)

routes.get('/app/quiosque/editar/:id', controllers.QuiosqueController.editar)
routes.post(
  '/app/quiosque/editar',
  upload.single('avatar'),
  controllers.QuiosqueController.update
)

routes.post(
  '/app/quiosque/inativos/editar',
  controllers.QuiosqueInativosController.update
)

routes.post('/app/schedule/delete', controllers.ScheduleController.delete)
routes.get('/app/schedule', controllers.ScheduleController.index)

routes.get(
  '/app/agendamento/diarios',
  controllers.AgendamentoDiariosController.index
)
routes.get(
  '/app/agendamento/diarios/:id',
  controllers.AgendamentoDiariosController.confirmaAgendamento
)

routes.get(
  '/app/agendamento/confirmacancelamento/:id',
  controllers.AgendamentoDiariosController.cancelarAgendamento
)

routes.post(
  '/app/agendamento/confirmacancelamento',
  controllers.AgendamentoDiariosController.cancelarAgendamento
)

routes.get('/app/user', controllers.UserController.index)
routes.post(
  '/app/user',
  upload.single('avatar'),
  controllers.UserController.storeNew
)

routes.get('/app/user/edit/senha/:id', controllers.UserController.editarsenha)
routes.post('/app/user/edit/upsenha', controllers.UserController.upsenha)

routes.get('/app/user/edit/:id', controllers.UserController.editar)
routes.post(
  '/app/user/edit/salvaredicaoperfil',
  upload.single('avatar'),
  controllers.UserController.salvaredicaoperfil
)
routes.get(
  '/app/reservas/new/:provider',
  controllers.AvailableQuiosqueController.index,
  controllers.ReservaController.create
)

routes.get('/app/codigo', controllers.CodigoController.index)
routes.post('/app/codigo', controllers.CodigoController.store)

routes.post('/app/reservas/new/:provider', controllers.ReservaController.store)

routes.get(
  '/app/availableQuiosque/:provider',
  controllers.AvailableQuiosqueController.index
)

module.exports = routes
