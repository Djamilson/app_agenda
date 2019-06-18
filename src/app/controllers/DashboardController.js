const { Quiosque, Reserva } = require('../models')
const moment = require('moment')
const { Op } = require('sequelize')

class DashboardController {
  async index (req, res) {
    const dataAgora = moment(moment().valueOf())
    const date = new Date()

    const ultimoDia = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate()
    console.log('Dia: ', ultimoDia)
    const providers_ = await Quiosque.findAll({
      where: {
        provider: true
      }
    })

    const getQtRegistros = async function (id) {
      return new Promise((resolve, reject) => {
        Reserva.count({
          where: {
            provider_id: id,
            date: {
              [Op.between]: [
                dataAgora.startOf('month').format(),
                dataAgora.endOf('month').format()
              ]
            }
          }
        }).then(result => {
          resolve(ultimoDia - result)
        })
      })
    }

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    const pp = []
    const providerss = async () => {
      return providers_.map(async provider => {
        const registro = await getQtRegistros(provider.id)

        const cast = Promise.resolve(registro)
        return cast
          .then(v => {
            // console.log('Final bom:', v)

            return {
              id: provider.id,
              name: provider.name,
              complemento: provider.complemento,
              avatar: provider.avatar,
              total: v
            }
          })
          .then(res => {
            console.log('Como fica:', res)
            pp.push(res)
            return res
          })
      })
    }

    const providerrs = await providerss()

    Promise.all(providerrs)
      .then()
      .then(async () => {
        //    const castt = Promise.resolve(providerrs)

        // const providers = await providerss()
        console.log('==', providerrs)

        return pp
      })
      .then(providers => {
        res.render('dashboard', { providers, usuario })
      })
  }
}

module.exports = new DashboardController()
