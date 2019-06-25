const { Quiosque } = require('../models')

class DashboarQuiosqueController {
  async index (req, res, next) {
    req.providers = await Quiosque.findAll({
      where: {
        provider: true
      },
      raw: true,
      group: ['Quiosque.id'],
      order: [['name', 'ASC']]
    })

    next()
  }
}

module.exports = new DashboarQuiosqueController()
