const { Quiosque, Reserva } = require('../models')
const moment = require('moment')
const { Op } = require('sequelize')

class DashboardController {
  async index (req, res) {
    const dataAgora = moment(moment().valueOf())
    const date = new Date()
    const diaHoje = date.getDate()
    const restrosFinal = []
    const filteredArr = []
    // console.log('dataAgora.startOf', dataAgora.format())

    //  console.log('providers providers', req.providers)

    const ultimoDia = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate()

    let getQtRegistros = async function (id) {
      return new Promise((resolve, reject) => {
        const dataAgoraa = moment(moment().valueOf())
        console.log('Data agora para ser buscada: ', dataAgoraa)

        Reserva.count({
          where: {
            quiosque_id: id,
            date: {
              [Op.between]: [
                dataAgora.format(),
                dataAgora.endOf('month').format()
              ]
            }
          }
        }).then(totalreservado => {
          //  console.log('totalreservadoa: ', totalreservado)
          console.log('========================')
          console.log('totalreservadoa: ', totalreservado)
          console.log(
            'Resta para ser reservado: ',
            ultimoDia - diaHoje - totalreservado
          )
          console.log('========================')

          resolve(ultimoDia - diaHoje - totalreservado + 1)
        })
      })
    }

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    const newArray = []

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
        console.log('Total reservado:', totalreservado)
        console.log('Ultimo dia:', ultimoDia)
        console.log('dia:', diaHoje_)

        console.log('Final:', ultimoDia - diaHoje_ - totalreservado + 1)

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
      console.log('========ID========== ')
      console.log(req.providers[i].id)
      console.log('================== ')
      console.log(add)
      console.log('================== ')

      // console.log('BOA: ', newArray)

      if (req.providers.length === i + 1) {
        console.log('BOA: ', newArray)
        res.render('dashboard', { providers: newArray, usuario })
      }
    }
    /*
    const providers = await req.providers.map(async quiosque => {
      const registro = await getQtRegistros(quiosque.id)

      console.log(
        '==>> Vamos adicionar esse valor: ',
        await registro,
        'Quantidade:',
        req.providers.length
      )

      return {
        id: quiosque.id,
        name: quiosque.name,
        complemento: quiosque.complemento,
        avatar: quiosque.avatar,
        total: registro
      }
    })
*/
    // console.log('providers', await providers)

    setTimeout(async () => {
      // console.log('providers', await providers)
      // res.render('dashboard', { providers, usuario })
    }, 2000)

    // const pp = []
    /*
    const providerss = async () => {
      return providers_.map(async provider => {
        const registro = await getQtRegistros(provider.id)

        console.log('==>> ', provider.id)
        const cast = Promise.resolve(registro)
        return cast.then(v => {
          pp.push({
            id: provider.id,
            name: provider.name,
            complemento: provider.complemento,
            avatar: provider.avatar,
            total: v
          })
        })
      })
    } */
  }
}

module.exports = new DashboardController()
