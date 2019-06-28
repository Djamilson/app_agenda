const { Reserva, User, Quiosque } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async delete (req, res) {
    const { id } = req.body

    const reserva = await Reserva.findByPk(id)

    await Reserva.update(
      { status: false, reserva },
      { where: { id: reserva.id } }
    )

    req.flash('success', 'Reserva removida com sucesso!')
    return res.redirect('/app/schedule')
  }

  async index (req, res) {
    let now = new Date()
    now.toLocaleString()

    let d3 = moment.utc({
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    })

    const available = await Reserva.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Quiosque, as: 'quiosque' }
      ],

      where: {
        user_id: req.session.user.id,
        status: true,
        date: {
          [Op.between]: [
            d3.startOf('month').format(),
            d3.endOf('month').format()
          ]
        }
      },
      order: [['date', 'DESC']]
    })

    if (!available) {
      req.flash('error', 'Você não tem reservas ainda!')
      return res.redirect('/app/dashboard')
    }

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      const reservadoem = moment.utc(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment.utc(reserva.date).format('DD/MM/YYYY')

      let hoje = new Date()
      hoje.toLocaleString()

      let d3 = moment.utc({
        year: hoje.getFullYear(),
        month: hoje.getMonth(),
        day: hoje.getDate() - 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })

      const dataReserva = new Date(moment.utc(reserva.date).format())
      const status = moment(d3).isBefore(dataReserva) // true

      const name = reserva.quiosque.name
      const complemento = reserva.quiosque.complemento
      const avatar = reserva.quiosque.avatar

      appointments.push({
        id: reserva.id,
        name: name,
        hora: reserva.horadareserva,
        complemento: complemento,
        reservadoem: reservadoem,
        reservadopara: reservadopara,
        avatar: avatar,
        status
      })
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('schedule/index', { appointments, usuario })
  }
}

module.exports = new ScheduleController()
