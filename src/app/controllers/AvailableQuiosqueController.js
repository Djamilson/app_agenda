const moment = require('moment')
const { Op } = require('sequelize')
const { Reserva } = require('../models')

class AvailableQuiosqueController {
  async index (req, res, next) {
    const dataAgora = moment(moment().valueOf())

    const providers = await Reserva.findAll({
      where: {
        quiosque_id: req.params.provider,
        date: {
          [Op.between]: [
            dataAgora.startOf('month').format(),
            dataAgora.endOf('month').format()
          ]
        },
        status: true
      }
    })

    const vetor = []

    providers.find((a, q) => {
      vetor.push(moment.utc(a.date).format('Y/MM/DD'))
    })

    req.available = vetor
    next()
  }
}

module.exports = new AvailableQuiosqueController()
