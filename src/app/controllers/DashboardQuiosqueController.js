const { Quiosque } = require('../models')

class DashboarQuiosqueController {
  async index (req, res, next) {
    console.log('olá')

    req.providers = await Quiosque.findAll({
      where: {
        provider: true
      },
      raw: true,
      group: ['Quiosque.id'],
      order: [['id', 'ASC']]
    })

    next()
  }
}

module.exports = new DashboarQuiosqueController()
