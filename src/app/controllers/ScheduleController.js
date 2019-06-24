const { Reserva, User, Quiosque } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async delete (req, res) {
    const { id } = req.params

    const reserva = await Reserva.findByPk(id)

    await Reserva.update(
      { status: false, reserva },
      { where: { id: reserva.id } }
    )

    req.flash('success', 'Reserva removida com sucesso!')

    const dataAgora = moment(moment().valueOf())

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
            dataAgora.startOf('month').format(),
            dataAgora.endOf('month').format()
          ]
        }
      },
      order: [['date', 'ASC']]
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
      const hora = moment.utc(now).format('HH:mm:ss')

      const name = reserva.quiosque.name
      const complemento = reserva.quiosque.complemento
      const avatar = reserva.quiosque.avatar

      appointments.push({
        id: reserva.id,
        name: name,
        hora: hora,
        complemento: complemento,
        reservadoem: reservadoem,
        reservadopara: reservadopara,
        avatar: avatar
      })
    })

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('schedule/index', { appointments, usuario })
  }

  async index (req, res) {
    console.log('Sessao: index', req.session.user.id)

    const dataAgora = moment(moment().valueOf())

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
            dataAgora.startOf('month').format(),
            dataAgora.endOf('month').format()
          ]
        }
      },
      order: [['date', 'ASC']]
    })

    if (!available) {
      req.flash('error', 'Você não tem reservas ainda!')
      return res.redirect('/app/dashboard')
    }

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      console.log('Reserva Reserva:', reserva)
      const reservadoem = moment.utc(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment.utc(reserva.date).format('DD/MM/YYYY')

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
        avatar: avatar
      })
    })
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('schedule/index', { appointments, usuario })
  }
}

module.exports = new ScheduleController()
