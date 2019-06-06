const { Reserva, User, Quiosque } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    const dataAgora = moment(moment().valueOf())

    const available = await Reserva.findAll({
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

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      const reservadoem = moment(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment(reserva.date).format('DD/MM/YYYY')
      const hora = moment(now).format('HH:mm:ss')

      const name = reserva.provider.name
      const complemento = reserva.provider.complemento
      const avatar = reserva.provider.avatar

      appointments.push({
        name: name,
        hora: hora,
        complemento: complemento,
        reservadoem: reservadoem,
        reservadopara: reservadopara,
        avatar: avatar
      })
    })
    const name = await req.session.user.name.split(' ')
    const user = { ...req.session.user, name: name[0] }
    console.log('====>>> ', user)
    console.log(appointments)

    return res.render('schedule/index', { appointments, user })
  }
}

module.exports = new ScheduleController()
