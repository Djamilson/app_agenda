const { Quiosque } = require('../models')

class DashboarQuiosqueController {
  async index (req, res) {
    const providers = await Quiosque.findAll({
      where: {
        provider: false
      },
      raw: true,
      group: ['Quiosque.id'],
      order: [['name', 'ASC']]
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    // Make sure the user has been verified
    if (!providers) {
      req.flash('success', 'Todos os itens estão ativos!')

      return res.redirect('/app/dashboard')
    }

    res.render('quiosque/inativos', { providers: providers, usuario })
  }

  async update (req, res) {
    const { id } = req.body

    const quiosque = await Quiosque.findByPk(id)

    await Quiosque.update(
      { provider: true, quiosque },
      { where: { id: quiosque.id } }
    )

    req.flash('success', `Quiosque editado com sucesso!`)

    const providers = await Quiosque.findAll({
      where: {
        provider: false
      },
      raw: true,
      group: ['Quiosque.id'],
      order: [['name', 'ASC']]
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    // Make sure the user has been verified
    if (!providers) {
      req.flash('success', 'Todos os itens estão ativos!')

      return res.redirect('/app/dashboard')
    }

    res.render('quiosque/inativos', { providers: providers, usuario })
  }
}

module.exports = new DashboarQuiosqueController()
