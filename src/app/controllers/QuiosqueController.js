const { Quiosque } = require('../models')

class UserController {
  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    console.log('........ >>>>')
    const providers = await Quiosque.findAll()

    console.log('Meus provaider: ', providers)

    return res.render('quiosque/index', { providers })
  }

  async create (req, res) {
    console.log('Sessao:', req.session.user.id)
    console.log('........ >>>>')
    const providers = await Quiosque.findAll()

    return res.render('quiosque/index', { providers })
  }

  async store (req, res) {
    const { filename: avatar } = req.file

    await Quiosque.create({ ...req.body, avatar })

    const providers = await Quiosque.findAll()

    return res.render('quiosque/index', { providers })
  }
}
module.exports = new UserController()
