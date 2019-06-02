const { Quiosque } = require('../models')

class DashboardController {
  async index (req, res) {
    const providers = await Quiosque.findAll({ where: { provider: true } })
    // var date = new Date()
    // const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    // console.log('Meu dia', ultimoDia)
    console.log('Dashboard: ', providers)
    res.render('dashboard', { providers })
  }
}

module.exports = new DashboardController()
