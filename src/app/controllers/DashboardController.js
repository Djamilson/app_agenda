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

    for (let i = 0; i < req.providers.length; i++) {
      // let registro = await getQtRegistros(req.providers[i].id)
      let registro = 0

      const dataAgoraa = moment(moment().valueOf())
      console.log('Data agora para ser buscada: ', dataAgoraa)

      await Reserva.count({
        where: {
          quiosque_id: req.providers[i].id,
          date: {
            [Op.between]: [
              dataAgoraa.format(),
              dataAgora.endOf('month').format()
            ]
          }
        }
      }).then(totalreservado => {
        registro = ultimoDia - diaHoje - totalreservado + 1
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

      console.log('BOA: ', newArray)

      if (req.providers.length === i + 1) {
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
