const { User } = require('../models')

class UserController {
  create (req, res) {
    return res.render('auth/signup')
  }

  async store (req, res) {
    const { filename: avatar } = req.file

    await User.create({ ...req.body, avatar })

    return res.redirect('/')
  }

  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    console.log('........ >>>>')

    const providers = await User.findAll({ where: { provider: true } })

    console.log('Meus provaider: ', providers)

    return res.render('user/new', { providers })
  }

  async createNew (req, res) {
    console.log('Sessao:', req.session.user.id)
    console.log('........ >>>>')
    const providers = await User.findAll({ where: { provider: true } })

    return res.render('user/new', { providers })
  }

  async storeNew (req, res) {
    const { filename: avatar } = req.file

    console.log('Meu req::: ', req.body)
    const provider = true
    await User.create({ ...req.body, provider, avatar })

    const providers = await User.findAll({ where: { provider: true } })

    return res.render('user/new', { providers })
  }
}
module.exports = new UserController()
