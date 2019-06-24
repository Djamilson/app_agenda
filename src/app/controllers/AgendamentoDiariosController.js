const { Reserva, User, Quiosque } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async cancelarAgendamento (req, res) {
    const { id } = req.body

    console.log('Fazendo o cancelamento: ID: ', id)

    const reserva = await Reserva.findByPk(id)

    await Reserva.update(
      { statusdeuso: false, reserva },
      { where: { id: reserva.id } }
    )

    req.flash('success', 'Cancelamento do uso com sucesso!')

    let now = new Date()
    now.toLocaleString()

    let d3 = moment({
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate() - 1,
      hour: 21,
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
        status: true,
        date: {
          [Op.between]: [d3.startOf('day').format(), d3.endOf('day').format()]
        }
      },
      order: [['date', 'ASC']]
    })

    if (!available) {
      req.flash('error', 'Não temos agendamentos para hoje!')
      return res.redirect('/app/dashboard')
    }

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      const reservadoem = moment.utc(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment.utc(reserva.date).format('DD/MM/YYYY')

      const name = reserva.quiosque.name
      const complemento = reserva.quiosque.complemento
      const avatar = reserva.quiosque.avatar

      appointments.push({
        id: reserva.id,
        name: name,
        cliente: reserva.user.name,
        statusdeuso: reserva.statusdeuso,
        hora: reserva.horadareserva,
        complemento: complemento,
        reservadoem: reservadoem,
        reservadopara: reservadopara,
        avatar: avatar
      })
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('schedule/diaria', { appointments, usuario })
  }

  async confirmaAgendamento (req, res) {
    const { id } = req.params

    const reserva = await Reserva.findByPk(id)

    await Reserva.update(
      { statusdeuso: true, reserva },
      { where: { id: reserva.id } }
    )

    req.flash('success', 'Reserva confirmada com sucesso!')

    return res.redirect('/app/agendamento/diarios')
  }

  async index (req, res) {
    let now = new Date()
    now.toLocaleString()

    let d3 = moment({
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate() - 1,
      hour: 21,
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
        status: true,
        date: {
          [Op.between]: [d3.startOf('day').format(), d3.endOf('day').format()]
        }
      },
      order: [['date', 'ASC']]
    })

    if (!available) {
      req.flash('error', 'Não temos agendamentos para hoje!')
      return res.redirect('/app/dashboard')
    }

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      const reservadoem = moment.utc(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment.utc(reserva.date).format('DD/MM/YYYY')

      const name = reserva.quiosque.name
      const complemento = reserva.quiosque.complemento
      const avatar = reserva.quiosque.avatar

      appointments.push({
        id: reserva.id,
        name: name,
        cliente: reserva.user.name,
        statusdeuso: reserva.statusdeuso,
        hora: reserva.horadareserva,
        complemento: complemento,
        reservadoem: reservadoem,
        reservadopara: reservadopara,
        avatar: avatar
      })
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('schedule/diaria', { appointments, usuario })
  }
}

module.exports = new ScheduleController()
