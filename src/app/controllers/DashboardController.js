const { Quiosque } = require('../models')

class DashboardController {
  async index (req, res) {
    const providers = await Quiosque.findAll({ where: { provider: true } })
    // var date = new Date()
    // const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    // console.log('Meu dia', ultimoDia)
    console.log('Dashboard: ', providers)

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    res.render('dashboard', { providers, usuario })
  }
}

module.exports = new DashboardController()
