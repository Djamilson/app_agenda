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
    const datee = moment(date, 'DD/MM/YYYY')

    await Reserva.create({ user_id: id, provider_id: provider, date: datee, status: true })
    req.flash('success', 'Reserva efetuada com sucesso!')
    return res.redirect('/app/dashboard')
  }
}

module.exports = new ReservaController()
