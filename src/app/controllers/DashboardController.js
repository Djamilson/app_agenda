const { Reserva } = require('../models')
const moment = require('moment')
const { Op } = require('sequelize')

class DashboardController {
  async index (req, res) {
    const dataAgora = moment(moment().valueOf())
    const newArray = []
    let now = new Date()
    now.toLocaleString()

    const ultimoDia = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate()

    let d3 = moment({
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate() - 1,
      hour: 21,
      minute: 0,
      second: 0,
      millisecond: 0
    })

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    for (let i = 0; i < req.providers.length; i++) {
      let registro = 0

      const diaHoje_ = now.getDate()

      await Reserva.count({
        where: {
          quiosque_id: req.providers[i].id,
          date: {
            [Op.between]: [d3.format(), dataAgora.endOf('month').format()]
          },
          status: true
        }
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
