const { Reserva, Quiosque } = require('../models')
const moment = require('moment')
const { Op } = require('sequelize')

class DashboardController {
  async desabilitarQuiosque (req, res) {
    const { id } = req.body

    console.log('MMIDI ID: ', id)
    const quiosque = await Quiosque.findByPk(id)

    await Quiosque.update(
      { provider: false, quiosque },
      { where: { id: quiosque.id } }
    )

    req.flash('success', `Quiosque desativado com sucesso!`)

    return res.redirect('/app/dashboard')
  }

  async index (req, res) {
    const newArray = []
    let now = new Date()
    now.toLocaleString()

    const ultimoDia = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate()

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    if (req.providers.length < 1) {
      req.flash('error', 'Ainda não temos opções para reserva!')
      res.render('dashboard', { usuario })
    }

    for (let i = 0; i < req.providers.length; i++) {
      let registro = 0

      const diaHoje_ = now.getDate()

      let d3 = moment.utc({
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })

      await Reserva.count({
        where: {
          quiosque_id: req.providers[i].id,
          date: {
            [Op.between]: [
              d3.startOf('day').format(),
              d3.endOf('month').format()
            ]
          },
          status: true
        },
        order: [['date', 'ASC']]
      }).then(totalreservado => {
        registro = ultimoDia - diaHoje_ - totalreservado + 1
      })

      const add = {
        id: req.providers[i].id,
        name: req.providers[i].name,
        complemento: req.providers[i].complemento,
        avatar: req.providers[i].avatar,
        total: registro
      }

      newArray[i] = add

      if (req.providers.length === i + 1) {
        res.render('dashboard', { providers: newArray, usuario })
      }
    }
  }
}

module.exports = new DashboardController()
