const moment = require('moment')
const { Op } = require('sequelize')
const { Reserva } = require('../models')

class AvailableQuiosqueController {
  async index (req, res, next) {
    const dataAgora = moment(moment().valueOf())

    const providers = await Reserva.findAll({
      where: {
        provider_id: req.params.provider,
        date: {
          [Op.between]: [
            dataAgora.startOf('month').format(),
            dataAgora.endOf('month').format()
          ]
        }
      }
    })

    const vetor = []

    providers.find((a, q) => {
      console.log('Índice: ', q, 'Valor: ', moment(a.date).format('Y/MM/DD'))
      vetor.push(moment(a.date).format('Y/MM/DD'))
    })

    console.log('Vetor:', vetor)

    req.available = vetor
    next()
  }
}

module.exports = new AvailableQuiosqueController()
