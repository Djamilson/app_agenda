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

    if (!available) {
      req.flash('error', 'Você não tem reservas ainda!')
      return res.redirect('/app/dashboard')
    }

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
      }
    })

    if (!available) {
      req.flash('error', 'Você não tem reservas ainda!')
      return res.redirect('/app/dashboard')
    }

    const appointments = []

    available.find(reserva => {
      let now = new Date(reserva.date)
      now.toLocaleString()

      const reservadoem = moment(reserva.created_at).format('DD/MM/YYYY')
      const reservadopara = moment(reserva.date).format('DD/MM/YYYY')
      const hora = moment(now).format('HH:mm:ss')

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
}

module.exports = new ScheduleController()
