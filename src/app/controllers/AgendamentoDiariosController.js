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

    const dataAgora = moment(d3.valueOf())
    // console.log('ppppp: ', moment.utc(dataAgora).format('YYYY-MM-DD HH:mm:ss'))

    //  console.log('ppppp: ', moment.utc(d3).format('YYYY-MM-DD HH:mm:ss'))

    const date = moment(parseInt(dataAgora))

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

    return res.render('schedule/diaria', { appointments, usuario })
  }
}

module.exports = new ScheduleController()
