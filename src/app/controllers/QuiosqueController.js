const { Quiosque } = require('../models')

class UserController {
  async index (req, res) {
    const providers = await Quiosque.findAll()

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('quiosque/index', { providers, usuario })
  }

  async create (req, res) {
    console.log('Sessao:', req.session.user.id)
    console.log('........ >>>>')
    //  const providers = await Quiosque.findAll()

    return res.render('quiosque/index')
  }

  async store (req, res) {
    const { filename: avatar } = req.file

    await Quiosque.create({ ...req.body, avatar })

    // const name = await req.session.user.name.split(' ')
    // const usuario = { ...req.session.user, name: name[0] }

    req.flash('success', `Cadastrado efetuado com sucesso!`)

    //  return res.redirect('/app/quiosque', { usuario })

    return res.redirect('/app/dashboard')
  }
}
module.exports = new UserController()
