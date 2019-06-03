const { Reserva, User, Quiosque } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    const dataAgora = moment(moment().valueOf())

    const appointments = await Reserva.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Quiosque, as: 'provider' }
      ],

      where: {
        user_id: req.session.user.id,
        status: true,
        date: {
          [Op.between]: [
            dataAgora.startOf('month').format(),
            dataAgora.endOf('month').format()
          ]
        }
      }
    })

    return res.render('schedule/index', { appointments })
  }
}

module.exports = new ScheduleController()
