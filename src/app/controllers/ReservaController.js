const moment = require('moment')
const { Quiosque, Reserva } = require('../models')

class ReservaController {
  async create (req, res) {
    const provider = await Quiosque.findByPk(req.params.provider)

    return res.render('reserva/create', { provider, available: req.available })
  }

  async store (req, res) {
    const { id } = req.session.user
    const { provider } = req.params
    const { date } = req.body
    // const datee = moment(moment(date, 'DD/MM/YYYY').valueOf()).format()
    const vetorData = date.split('/')

    let dataParaBusca = moment
      .utc({
        year: vetorData[2],
        month: vetorData[1] - 1,
        day: vetorData[0],
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })
      .format()

    const reserva = await Reserva.findOne({
      where: { status: true, quiosque_id: provider, date: dataParaBusca }
    })

    if (reserva) {
      req.flash('error', 'Não foi possível efetuar a reserva, tente novamente!')
      return res.redirect('/app/dashboard')
    }

    let now = new Date()
    now.toLocaleString()

    let d3 = moment
      .utc({
        year: vetorData[2],
        month: vetorData[1] - 1,
        day: vetorData[0],
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })
      .format()

    /*
    let d3 = moment({
      year: vetorData[2],
      month: vetorData[1] - 1,
      day: vetorData[0] - 1,
      hour: 21,
      minute: 0,
      second: 0,
      millisecond: 0
    }) */

    console.log(
      `hora da Reserva :: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    )
    await Reserva.create({
      user_id: id,
      quiosque_id: provider,
      date: d3,
      status: true,
      horadareserva: `${now.getHours() -
        3}:${now.getMinutes()}:${now.getSeconds()}`
    })
    req.flash('success', 'Reserva efetuada com sucesso!')
    return res.redirect('/app/dashboard')
  }
}

module.exports = new ReservaController()
