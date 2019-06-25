const { Quiosque } = require('../models')

class UserController {
  async index (req, res) {
    const providers = await Quiosque.findAll()

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('quiosque/index', { providers, usuario })
  }

  async create (req, res) {
    return res.render('quiosque/index')
  }

  async editar (req, res) {
    const { id } = req.params
    const quiosqueedit = await Quiosque.findByPk(id)

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('quiosque/editar', { quiosqueedit, usuario })
  }

  async update (req, res) {
    const { id, name, provider, complemento } = req.body

    const quiosque = await Quiosque.findByPk(id)
    let status = false

    const file = req.file

    if (provider !== undefined) {
      status = true
    }

    if (!file) {
      await Quiosque.update(
        { name, complemento, provider: status, quiosque },
        { where: { id: quiosque.id } }
      )
    } else {
      const { filename: avatar } = req.file
      await Quiosque.update(
        { name, complemento, avatar, provider: status, quiosque },
        { where: { id: quiosque.id } }
      )
    }

    req.flash('success', `Quiosque editado com sucesso!`)

    return res.redirect('/app/dashboard')
  }

  async store (req, res) {
    const { filename: avatar } = req.file

    await Quiosque.create({ ...req.body, avatar })

    req.flash('success', `Cadastrado efetuado com sucesso!`)

    return res.redirect('/app/dashboard')
  }
}
module.exports = new UserController()
