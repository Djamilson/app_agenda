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

    console.log('===> ', date)
    let now = new Date()
    now.toLocaleString()

    // the hour in UTC+0 time zone (London time without daylight savings)
    console.log('===============================') // shows current date/time
    console.log('=====> Anos: ', vetorData[2])
    console.log('=====> Mês: ', vetorData[1] - 1)
    console.log('====>Dia: ', vetorData[0])
    console.log('====>Hora ', now.getHours())
    console.log('====>Minutos ', now.getMinutes())
    console.log('====>Segundos ', now.getSeconds())
    console.log('====>Milliseconds ', now.getMilliseconds())
    console.log('===============================') // shows current date/time

    let d3 = moment({
      year: vetorData[2],
      month: vetorData[1] - 1,
      day: vetorData[0],
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      millisecond: now.getMilliseconds()
    })
    console.log(d3.format())
    console.log(d3.format('HH:mm:ss'))
    console.log(d3.format('ll'))
    console.log(d3.format('YYYY-MM-DD'))

    let dateee = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )
    console.log(dateee)
    console.log('Data final:', d3.format())

    await Reserva.create({
      user_id: id,
      provider_id: provider,
      date: d3.format(),
      status: true
    })
    req.flash('success', 'Reserva efetuada com sucesso!')
    return res.redirect('/app/dashboard')
  }
}

module.exports = new ReservaController()
